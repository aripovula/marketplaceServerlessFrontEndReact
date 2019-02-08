import gql from "graphql-tag";

export default gql(`
query ($id: ID!) {
  getCompany(id: $id) {
    id
    name
    creditRating
    status
    orders {
      items {
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
    }
  }
}
`);
