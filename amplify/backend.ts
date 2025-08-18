import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import * as aws_cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as aws_cloudfront_origins from 'aws-cdk-lib/aws-cloudfront-origins';

const backend = defineBackend({
  auth,
  data,
  storage,
});

const s3Bucket = backend.storage.resources.bucket;
const distribution = new aws_cloudfront.Distribution(
  backend.storage.stack,
  'ThumbnailCdn',
  {
    defaultBehavior: {
      origin: aws_cloudfront_origins.S3BucketOrigin.withOriginAccessControl(s3Bucket, {
        originPath: '/media/thumbnail-image',
      }),
      viewerProtocolPolicy: aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      allowedMethods: aws_cloudfront.AllowedMethods.ALLOW_GET_HEAD,
      cachedMethods: aws_cloudfront.CachedMethods.CACHE_GET_HEAD,
      cachePolicy: aws_cloudfront.CachePolicy.CACHING_OPTIMIZED,
    },
    priceClass: aws_cloudfront.PriceClass.PRICE_CLASS_200,
  }
);

// Output CloudFront domain for usage
backend.addOutput({
  custom: {
    thumbnailCdnUrl: `https://${distribution.distributionDomainName}`,
  },
});
