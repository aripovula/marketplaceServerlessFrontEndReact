import gql from "graphql-tag";

export default gql(`
mutation (
    $companyID: ID!
    $reorderRuleID: String!
    $productID: String!
    $maxPrice: Float!
    $minProductRating: Float!
    $isRuleEffective: Boolean!
    $isCashPayment: Boolean!
    $reorderLevel: Int!
    $reorderQnty: Int!
    $bestOfferType: BestOfferEnum
    $secondBestOfferType: BestOfferEnum!

) {
    updateReOrderRule(input: {
      companyID: $companyID,
      reorderRuleID: $reorderRuleID,
      productID: $productID,
      maxPrice: $maxPrice,
      minProductRating: $minProductRating,
      isRuleEffective: $isRuleEffective,
      isCashPayment: $isCashPayment,
      reorderLevel: $reorderLevel,
      reorderQnty: $reorderQnty,
      bestOfferType: $bestOfferType,
      secondBestOfferType: $secondBestOfferType,

  }) {
      companyID
      reorderRuleID
      productID
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
