import gql from 'graphql-tag'

export default gql `
subscription NewNotifSub {
  onCreateNotification {
    companyID
    notificationID
    notificationTextRegular
    notificationTextHighlighted
  }
}`;