import gql from "graphql-tag";

export default gql(`
mutation (
    $companyID: ID!
    $reorderRuleID: String!
    $productID: String!
    $maxPrice: Float!
    $bestOfferType: BestOfferEnum
    $secondBestOfferType: BestOfferEnum!
    $minProductRating: Float!
    $isRuleEffective: Boolean!
    $isCashPayment: Boolean!
    $reorderLevel: Int!
    $reorderQnty: Int!
) {
    updateReOrderRule(input: {
      companyID: $companyID,
      reorderRuleID: $reorderRuleID,
      productID: $productID,
      maxPrice: $maxPrice,
      bestOfferType: $bestOfferType,
      secondBestOfferType: $secondBestOfferType,
      minProductRating: $minProductRating,
      isRuleEffective: $isRuleEffective,
      isCashPayment: $isCashPayment,
      reorderLevel: $reorderLevel,
      reorderQnty: $reorderQnty
  }) {
      companyID
      reorderRuleID
      productID
      product
      maxPrice
      bestOfferType
      secondBestOfferType
      minProductRating
      isRuleEffective
      isCashPayment
      reorderLevel
      reorderQnty
  }
}`);
