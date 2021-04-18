import * as React from 'react';
import {observer} from 'mobx-react';
import {action, observable} from "mobx";
import {Button, Dropdown, DropdownButton, Modal, Spinner, Table} from "react-bootstrap";
import {paymentPlanApi} from "app/constants/api";
import {PaymentPlan} from "app/api/api";
import {MainMenu} from "app/components";
import {getTimeUnitName} from "app/constants/locale_ru";
import {numberFormat} from "../../../../../../booking-src/src/app/constants/numberFormat";

class PaymentPlanListData {
    @observable isLoading = true
    @observable error = ""
    @observable list: Array<PaymentPlan> = new Array<PaymentPlan>()
    @observable isShowDeletionDialog = false;
    @observable deletionPaymentPlan: PaymentPlan = null;

    @action
    deletePaymentPlan(paymentPlan) {
        paymentPlanApi().deletePaymentPlanUsingPOST({
            pubId: paymentPlan.pubId
        }).then(() => {
            this.list = this.list.filter(a => a.pubId != paymentPlan.pubId)
        }).catch(error => {
            console.log(error);
        })
    }
}

@observer
export class PaymentPlanListContainer extends React.Component<any, any> {
    private data = new PaymentPlanListData()

    constructor(props: any, context: any) {
        super(props, context);

        this.data.isLoading = true
        paymentPlanApi().getPaymentPlanListUsingPOST({}).then(
            (response) => {
                this.data.list = response.data
                this.data.isLoading = false
            }).catch(error => {
            if (error && error.response && error.response.data.message) {
                this.data.error = error.response.data.message
            }

            this.data.isLoading = false;
        })
    }

    deletePaymentPlan = () => {
        this.data.deletePaymentPlan(this.data.deletionPaymentPlan)
        this.data.isShowDeletionDialog = false;
    }

    openDeletionDialog = (asset) => {
        return () => {
            this.data.deletionPaymentPlan = asset;
            this.data.isShowDeletionDialog = true
        }
    }

    hideDeletionDialog = () => {
        this.data.isShowDeletionDialog = false
        this.data.deletionPaymentPlan = null;
    }

    editPaymentPlan = (paymentPlan) => {
        return () => {
            this.props.history.push("/dashboard/edit-payment-plan/" + paymentPlan.pubId)
        }
    }

    newPaymentPlan = () => {
        this.props.history.push("/dashboard/create-payment-plan")
    }

    render() {
        const items = this.data.list.map((paymentPlan) =>
            <tr key={paymentPlan.pubId}>
                <td onClick={this.editPaymentPlan(paymentPlan)}>{paymentPlan.locationName}</td>
                <td onClick={this.editPaymentPlan(paymentPlan)}>{paymentPlan.name}</td>
                <td onClick={this.editPaymentPlan(paymentPlan)}>{paymentPlan.assetName}</td>
                <td onClick={this.editPaymentPlan(paymentPlan)}>{getTimeUnitName(paymentPlan.unit)}</td>
                <td onClick={this.editPaymentPlan(paymentPlan)} className="text-nowrap text-right">

                    {paymentPlan?.assumption?.workTimeRanges?.length > 0 ?
                        <div>
                            {paymentPlan.assumption.workTimeRanges
                                .filter(wtr => !wtr.isWeekend)
                                .map((wtr, index) =>
                                    <div>будни:&nbsp;
                                        <span>{wtr.start} &ndash; {wtr.end}</span>
                                        &nbsp;
                                        {numberFormat(wtr.price)}р
                                    </div>
                                )
                            }
                            {paymentPlan.assumption.workTimeRanges
                                .filter(wtr => wtr.isWeekend)
                                .map((wtr, index) =>
                                    <div>выходные:&nbsp;
                                        <span>{wtr.start} &ndash; {wtr.end}</span>
                                        &nbsp;
                                        {numberFormat(wtr.price)}р
                                    </div>
                                )
                            }
                        </div>
                        : (<>{numberFormat(paymentPlan.price)}р</>)
                    }
                </td>
                <td className="text-right">
                    <DropdownButton variant="outline-secondary" title="&bull;&bull;&bull;">
                        <Dropdown.Item onClick={this.editPaymentPlan(paymentPlan)}>Редактировать</Dropdown.Item>
                        <Dropdown.Item onClick={this.openDeletionDialog(paymentPlan)}>Удалить</Dropdown.Item>
                    </DropdownButton>
                </td>
            </tr>
        );
        return (
            <div>
                <MainMenu/>
                <h4>
                   Тарифы
                    <Button
                        variant="light"
                        onClick={this.newPaymentPlan}
                    > + </Button>
                </h4>
                <Table striped={true} bordered={true} hover>
                    <thead>
                    <tr>
                        <th>Локация</th>
                        <th>Название</th>
                        <th>Объект аренды</th>
                        <th>Длительность</th>
                        <th>Цена</th>
                        <th/>
                    </tr>
                    </thead>
                    <tbody>
                    {this.data.isLoading ?
                        <tr>
                            <td colSpan={6}><Spinner size="sm" animation="grow"/></td>
                        </tr>
                        : items
                    }
                    </tbody>
                </Table>
                <Modal show={this.data.isShowDeletionDialog} onHide={this.hideDeletionDialog}>
                    <Modal.Header closeButton>
                        <Modal.Title>Удаление</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <p>
                            Тариф будет удален. Продолжить?
                        </p>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.hideDeletionDialog}>Нет</Button>
                        <Button variant="primary" onClick={this.deletePaymentPlan}>Да</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}