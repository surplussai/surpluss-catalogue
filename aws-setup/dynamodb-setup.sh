#!/bin/bash
# Run once to create DynamoDB tables in ap-south-1
# Prerequisites: AWS CLI configured with correct credentials

REGION="ap-south-1"

echo "Creating surpluss-catalogues table..."
aws dynamodb create-table \
  --table-name surpluss-catalogues \
  --attribute-definitions AttributeName=catalogueId,AttributeType=S \
  --key-schema AttributeName=catalogueId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region $REGION

echo "Creating surpluss-products table..."
aws dynamodb create-table \
  --table-name surpluss-products \
  --attribute-definitions \
    AttributeName=catalogueId,AttributeType=S \
    AttributeName=productId,AttributeType=S \
  --key-schema \
    AttributeName=catalogueId,KeyType=HASH \
    AttributeName=productId,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --region $REGION

echo "Done. Tables created in $REGION."
echo "Verify with: aws dynamodb list-tables --region $REGION"
