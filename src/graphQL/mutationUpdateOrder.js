import gql from "graphql-tag";

export default gql(`
mutation (
    $companyID: ID!
    $orderID: String!
    $producerID: String!
    $productID: String!
    $orderTime: AWSTimestamp!
    $status: OrderStatus!
    $bestOfferType: BestOfferEnum!
    $price: Float!
    $quantity: Int!
    $orderedProductRating: Float
    $minProductRating: Float
) {
  updateOrder(input: {
    companyID: $companyID,
    orderID: $orderID,
    productID: $productID,
    producerID: $producerID,
    orderTime: $orderTime,
    status:$status,
    price: $price,
    quantity: $quantity,
    minProductRating: $minProductRating,
    orderedProductRating: $orderedProductRating,
    bestOfferType: $bestOfferType
  }) {
    companyID
    orderID
    producerID
    productID
    orderTime
    status
    price
    quantity
    orderedProductRating
    bestOfferType
    minProductRating
  }
}`);
