import { cookiesClient } from "@/utils/amplify-utils";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { Stripe } from "stripe";
import { env } from "@/lib/env";

export async function POST(req: Request) {
    let event: Stripe.Event
    const body = await req.text();
    const signature = (await headers()).get('stripe-signature');

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature as string,
            env.STRIPE_WEBHOOK_SECRET as string
        );
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        if (err! instanceof Error) console.log(err);
        console.log(`❌ Error message: ${errorMessage}`);
        return NextResponse.json(
            { message: `Webhook Error: ${errorMessage}` },
            { status: 400 }
        );
    }

    // Successfully constructed event.
    console.log('✅ Success:', event.id);

    const permittedEvents: string[] = [
        'checkout.session.completed',
        'payment_intent.succeeded',
        'payment_intent.payment_failed',
    ];

    if (permittedEvents.includes(event.type)) {
        let data;

        try {
            switch (event.type) {
                case 'checkout.session.completed':
                    data = event.data.object as Stripe.Checkout.Session;
                    const courseId = data.metadata?.courseId;
                    const userId = data.metadata?.userId;
                    const customerId = data.customer as string;

                    if (!courseId) {
                        throw new Error("Course id not found...");
                    }

                    if (!userId) {
                        throw new Error("User id not found...");
                    }

                    const { data: user } = await cookiesClient.models.UserProfile.get({
                        id: userId,
                    },
                        {
                            selectionSet: [
                                "id",
                                "stripeCustomerId"
                            ],
                            authMode: "iam"
                        });


                    if (!user || user.stripeCustomerId !== customerId) {
                        throw new Error("User not found...");
                    }

                    await cookiesClient.models.Enrollment.update({
                        userId: user.id,
                        courseId: courseId,
                        amount: data.amount_total as number,
                        status: "Active"
                    }, {
                        authMode: "iam"
                    })
                    console.log(`💰 CheckoutSession status: ${data.payment_status}`);
                    break;
                case 'payment_intent.payment_failed':
                    data = event.data.object as Stripe.PaymentIntent;
                    console.log(`❌ Payment failed: ${data.last_payment_error?.message}`);
                    break;
                case 'payment_intent.succeeded':
                    data = event.data.object as Stripe.PaymentIntent;
                    console.log(`💰 PaymentIntent status: ${data.status}`);
                    break;
                default:
                    throw new Error(`Unhandled event: ${event.type}`);
            }
        } catch (error) {
            console.log(error);
            return NextResponse.json(
                { message: 'Webhook handler failed' },
                { status: 500 }
            );
        }
    }

    // const session = event.data.object as Stripe.Checkout.Session;

    // if (event.type === "checkout.session.completed") {
    //     const courseId = session.metadata?.courseId;
    //     const userId = session.metadata?.userId;
    //     const customerId = session.customer as string;

    //     if (!courseId) {
    //         throw new Error("Course id not found...");
    //     }

    //     if (!userId) {
    //         throw new Error("User id not found...");
    //     }

    //     const { data: user } = await cookiesClient.models.UserProfile.get({
    //         id: userId,
    //     },
    //         {
    //             selectionSet: [
    //                 "id",
    //                 "stripeCustomerId"
    //             ],
    //             authMode: "iam"
    //         });


    //     if (!user || user.stripeCustomerId !== customerId) {
    //         throw new Error("User not found...");
    //     }

    //     await cookiesClient.models.Enrollment.update({
    //         userId: user.id,
    //         courseId: courseId,
    //         amount: session.amount_total as number,
    //         status: "Active"
    //     }, {
    //         authMode: "iam"
    //     })
    // }

    // Return a response to acknowledge receipt of the event.
    return NextResponse.json({ message: 'Received' }, { status: 200 });
}