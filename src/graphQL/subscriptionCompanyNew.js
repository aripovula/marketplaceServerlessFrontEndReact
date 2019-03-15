import gql from 'graphql-tag'

export default gql`
subscription OnNewCo {
  onCreateCompany {
    id
    name
  }
}`;