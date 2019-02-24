import gql from "graphql-tag";

export default gql(`
mutation (
    $companyID: ID!
    $reorderRuleID: String!
    $productID: String!
    $product: String!
    $maxPrice: Float!
    $minProductRating: Float!
    $isRuleEffective: Boolean!
    $isCashPayment: Boolean!
    $reorderLevel: Int!
    $reorderQnty: Int!
    $bestOfferType: BestOfferEnum
    $secondBestOfferType: BestOfferEnum!

) {
    createReOrderRule(input: {
      companyID: $companyID,
      reorderRuleID: $reorderRuleID,
      productID: $productID,
      product: $product,
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
