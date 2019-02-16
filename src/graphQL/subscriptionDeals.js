import gql from 'graphql-tag'

export default gql `
subscription NewDealSub {
  onCreateDeal {
      productID
      dealID
      orderID
      dealStatus
      buyerID
      producerID
      dealTime
      dealQuantity
      dealPrice
      productRatingByBuyer
      blockchainBlockID
      blockchainBlockStatus
  }
}`;