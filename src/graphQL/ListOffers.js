import gql from 'graphql-tag';

export default gql`
query ListOffers {
  listOffers {
    items {
      companyID
      offerID
      productID
      price
      available
    }
  }
}`