import gql from "graphql-tag";

export default gql(`
mutation (
    $companyID: ID!
    $orderID: String!
    $productID: String!
    $product: String!
    $status: OrderStatus!
    $note: String
  	$dealPrice: Float
    $maxPrice: Float!
    $quantity: Int!
    $bestOfferType: BestOfferEnum!
    $secondBestOfferType: BestOfferEnum!
    $minProductRating: Float!
    $isCashPayment: Boolean!
) {
  createOrder(input: {
    companyID: $companyID,
    orderID: $orderID,
    productID: $productID,
    product: $product,
    status:$status,
    note: $note,
	  dealPrice: $dealPrice,
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
    note
	  dealPrice
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
