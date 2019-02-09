import gql from "graphql-tag";

export default gql(`
query($companyID: ID!, $orderID: String!) {
  getReOrderRule(companyID: $companyID, orderID: $orderID) {
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
