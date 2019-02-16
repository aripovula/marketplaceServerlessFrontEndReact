import gql from "graphql-tag";

export default gql(`
query {
  listDeals(limit: 100) {
    items {
      productID
      dealID
      orderID
      dealStatus
      buyerID
      producerID
      dealTime
      dealPrice
      dealQuantity
      productRatingByBuyer
      blockchainBlockID
      blockchainBlockStatus
    }
  }
}
`);