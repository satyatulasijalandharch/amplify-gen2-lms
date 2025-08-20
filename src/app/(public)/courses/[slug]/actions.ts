"use server"

import { requireUser } from "@/app/data/user/require-user";
import { env } from "@/lib/env";
import { stripe } from "@/lib/stripe";
import { ApiResponse } from "@/lib/types";
import { cookiesClient } from "@/utils/amplify-utils";
import { redirect } from "next/navigation";
import Stripe from "stripe";

export async function enrollInCourseAction(courseId: string): Promise<ApiResponse | never> {
    const user = await requireUser()

    let checkoutUrl: string;
    try {

        const { data: course } = await cookiesClient.models.Course.get({ id: courseId }, {
            selectionSet: [
                "id",
                "title",
                "price",
                "slug"
            ]
        });

        if (!course) {
            return {
                status: "error",
                message: "Course not found"
            }
        }

        let stripeCustomerId: string
        const { data: userWithStripeCustomerId } = await cookiesClient.models.UserProfile.get({ id: user.sub }, {
            selectionSet: [
                "stripeCustomerId"
            ]
        });

        if (userWithStripeCustomerId?.stripeCustomerId) {
            stripeCustomerId = userWithStripeCustomerId.stripeCustomerId;
        } else {
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.name,
                metadata: {
                    userId: user.sub
                }
            })

            stripeCustomerId = customer.id
            await cookiesClient.models.UserProfile.update({
                id: user.sub,
                stripeCustomerId: stripeCustomerId
            })
        }



        const { data: existingEnrollment } = await cookiesClient.models.Enrollment.get({
            userId: user.sub,
            courseId: course.id
        }, {
            selectionSet: [
                "status",
                "user.id",
                "course.id",
            ]
        })
        if (existingEnrollment?.status === "Active") {
            return {
                status: "success",
                message: "You are already enrolled in this ourse"
            }
        }

        if (existingEnrollment) {
            await cookiesClient.models.Enrollment.update({
                userId: existingEnrollment.user.id,
                courseId: existingEnrollment.course.id,
                amount: course.price,
                status: "Pending",
            })
        } else {
            await cookiesClient.models.Enrollment.create({
                userId: user.sub,
                courseId: course.id,
                amount: course.price,
                status: "Pending",
            })
        }
        const checkoutSession = await stripe.checkout.sessions.create({
            customer: stripeCustomerId,
            line_items: [
                {
                    price: "price_1Ry33dHh8PWZ6V0DvsS6HEco",
                    quantity: 1
                }
            ],
            mode: "payment",
            success_url: `${env.BASE_URL}/payment/success`,
            cancel_url: `${env.BASE_URL}/payment/cancel`,
            metadata: {
                userId: user.sub,
                courseId: course.id,
            }
        })

        checkoutUrl = checkoutSession.url as string;

    } catch (error) {
        if (error instanceof Stripe.errors.StripeError) {
            return {
                status: "error",
                message: "Payment system error. Please try again later."
            }
        }

        return {
            status: "error",
            message: "Failed to enroll in course"
        }

    }

    redirect(checkoutUrl);
}