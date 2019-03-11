import React from 'react'


import { graphql, compose } from 'react-apollo'
import ListNotifications from "../graphQL/queryAllNotifications";
// import QueryAllProducts from "../graphQL/queryAllProducts";
import NewNotificationSubscription from '../graphQL/subscriptionNotifications';
import ModalInfo from "./ModalInfo";

class Notifications extends React.Component {
    
    notificationSubscription;
    
    constructor(props) {
        super(props);
        this.state = {
            infoModalData: null
        };
        this.handleInfoModalClose = this.handleInfoModalClose.bind(this);
    }

    componentWillMount() {
        this.notificationSubscription = this.props.subscribeToNewNotifications();
    }

    componentWillUnmount() {
        // this.notificationSubscription();
    }

    handleInfoModalClose() {
        this.setState({ infoModalData: null });
    }

    render() {
        return (
            <div style={{ textAlign: "left", marginLeft: "15px"}}>
               <div>
                {
                    this.props.notifications.sort((a, b) => a.notificationID.localeCompare(b.notificationID)).map((r, i) => (
                        <div key={i} className="responsiveFSize">
                            <span className="smalltext">{r.notificationTextRegular} &nbsp;</span>
                            {r.notificationTextHighlighted.includes('previousHash') &&
                                <span className="addnlightbgsm notbold cursorpointer"
                                    onClick={() => {
                                        const block = JSON.parse(r.notificationTextHighlighted);
                                        this.setState(() => ({
                                            infoModalData: {
                                                type: 'newBlock',
                                                shortText: `Blockchain block #${block.index}`,
                                                mainText: `Blockchain block details:`,
                                                bIndex: `Index: ${block.index}`,
                                                bHash: `Hash: "${block.hash}"`,
                                                bPHash: `Previous hash: ${block.previousHash}`,
                                            }
                                        }));
                                    }}>&nbsp;details&nbsp;&nbsp;&nbsp;
                            </span>

                            }
                        </div>
                    ))
                }
                </div>
                <div>
                    {this.state.infoModalData &&
                        <ModalInfo
                            data={this.state.infoModalData}
                            handleInfoModalClose={this.handleInfoModalClose}
                        />
                    }
                </div>
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
