import React from 'react'


import { graphql, compose } from 'react-apollo'
import ListNotifications from "../graphQL/queryAllNotifications";
// import QueryAllProducts from "../graphQL/queryAllProducts";
import NewNotificationSubscription from '../graphQL/subscriptionNotifications';
// import ModalInfo from "./ModalInfo";

class Notifications extends React.Component {
    
    notificationSubscription;
    
    // constructor(props) {
    //     super(props);
    //     this.state = {
    //         infoModalData: null
    //     };
    //     this.handleInfoModalClose = this.handleInfoModalClose.bind(this);
    // }

    componentWillMount() {
        this.notificationSubscription = this.props.subscribeToNewNotifications();
    }

    componentWillUnmount() {
        // this.notificationSubscription();
    }

    // handleInfoModalClose() {
    //     this.setState({ infoModalData: null });
    // }

    render() {
        return (
            <div className="">
               
                {
                    this.props.notifications.map((r, i) => (
                        <div key={i} className="responsiveFSize">
                            <p>${r.notificationTextRegular}-{r.notificationTextHighlighted}</p>
                        </div>
                    ))
                }
                
            </div>
        )
    }
}

export default compose(
    graphql(ListNotifications, {
        options: {
            fetchPolicy: 'cache-and-network'
        },
        props: props => ({
            notifications: props.data.listNotifications ? props.data.listNotifications.items : [],
            subscribeToNewNotifications: params => {
                props.data.subscribeToMore({
                    document: NewNotificationSubscription,
                    updateQuery: (prev, { subscriptionData: { data: { onCreateNotification } } }) => {
                        console.log('onCreateNotification - ', onCreateNotification);
                        return {
                            ...prev,
                            listNotifications: {
                                __typename: 'NotificationConnection',
                                items: [onCreateNotification, ...prev.listNotifications.items.filter(notification => notification.notificationID !== onCreateNotification.notificationID)]
                            }
                        }
                    }
                })
            }
        })
    })
)(Notifications)
