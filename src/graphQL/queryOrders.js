import gql from "graphql-tag";

export default gql(`
  query($limit: Int, $nextToken: String, $companyID: ID) {
    listOrders(limit: $limit,
    nextToken: $nextToken, 
    filter: {
      companyID: {
        eq: $companyID
      }
    }
    ) {
      items {
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
      nextToken
    }
  }
`);