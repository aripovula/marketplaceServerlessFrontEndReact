import gql from "graphql-tag";

export default gql(`
query {
  listOrders(limit: 100) {
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
  }
}
`);