import gql from "graphql-tag";

export default gql(`
query {
  listOrders(limit: 100) {
    items {
      companyID
      orderID
      productID
      product {
        id,
        name
        modelNo
        specificationURL
        imageURL
        lastTenRatingAverage
    }
      status
      maxPrice
      quantity
      bestOfferType
      secondBestOfferType
      minProductRating
      isCashPayment
    }
  }
}
`);