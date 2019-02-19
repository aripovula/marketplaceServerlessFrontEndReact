import gql from "graphql-tag";

export default gql(`
query {
  listNotifications(limit: 100) {
    items {
      companyID
      notificationID
      notificationTextRegular
      notificationTextHighlighted
    }
  }
}
`);