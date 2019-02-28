import gql from 'graphql-tag'

export default gql`
subscription ($companyID: ID) {
  onCreateReOrderRule(
    filter: {
      companyID: {
        eq: $companyID
      }
    }
    )  {
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
}`;