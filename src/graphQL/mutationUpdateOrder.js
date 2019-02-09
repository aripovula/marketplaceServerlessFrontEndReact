import gql from "graphql-tag";

export default gql(`
mutation (
    $companyID: ID!
    $orderID: String!
    $productID: String!
    $status: OrderStatus!
    $maxPrice: Float!
    $quantity: Int!
    $bestOfferType: BestOfferEnum!
    $secondBestOfferType: BestOfferEnum!
    $minProductRating: Float!
    $isCashPayment: Boolean!
) {
  updateOrder(input: {
    companyID: $companyID,
    orderID: $orderID,
    productID: $productID,
    status:$status,
    maxPrice: $maxPrice,
    quantity: $quantity,
    bestOfferType: $bestOfferType,
    secondBestOfferType: $secondBestOfferType
    minProductRating: $minProductRating,
    isCashPayment: $isCashPayment,
  }) {
    companyID
    orderID
    productID
    status
    maxPrice
    quantity
    bestOfferType
    secondBestOfferType
    minProductRating
    isCashPayment
    product {
      id,
      name
      modelNo
      specificationURL
      imageURL
      lastTenRatingAverage
    }

  }
}`);
