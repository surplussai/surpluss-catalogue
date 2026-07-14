#!/bin/bash
# Create S3 buckets and configure for web hosting
REGION="ap-south-1"
APP_BUCKET="surpluss-catalogue-app"
IMAGES_BUCKET="surpluss-catalogue-images"

echo "Creating S3 buckets..."
aws s3api create-bucket \
  --bucket $APP_BUCKET \
  --region $REGION \
  --create-bucket-configuration LocationConstraint=$REGION

aws s3api create-bucket \
  --bucket $IMAGES_BUCKET \
  --region $REGION \
  --create-bucket-configuration LocationConstraint=$REGION

# Allow public read for images bucket
aws s3api put-bucket-policy \
  --bucket $IMAGES_BUCKET \
  --policy '{
    "Version": "2012-10-17",
    "Statement": [{
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::'"$IMAGES_BUCKET"'/*"
    }]
  }'

echo "S3 buckets created."
echo "Images URL: https://$IMAGES_BUCKET.s3.$REGION.amazonaws.com/<filename>"
