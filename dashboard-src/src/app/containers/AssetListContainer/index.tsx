import * as React from 'react';
import {observer} from 'mobx-react';
import {action, observable} from "mobx";
import {MainMenu} from "app/components/MainMenu";
import {Button, Dropdown, DropdownButton, Modal, Spinner, Table} from "react-bootstrap";
import {assetsApi} from "app/constants/api";
import {Asset} from "../../../api";

class AssetListData {
    @observable isLoading = true
    @observable error = ""
    @observable assets: Array<Asset> = new Array<Asset>()
    @observable isShowDeletionDialog = false;
    @observable deletionAsset: Asset = null;

    @action
    deleteAsset(asset) {
        assetsApi().deleteUsingPOST({
            pubId: asset.pubId
        }).then(() => {
            this.assets = this.assets.filter(a => a.pubId != asset.pubId)
        }).catch(error => {
            console.log(error);
        })
    }
}

@observer
export class AssetListContainer extends React.Component<any, any> {
    private data = new AssetListData()

    constructor(props: any, context: any) {
        super(props, context);

        this.data.isLoading = true
        assetsApi().assetsListUsingPOST({
            capacityFilter: "all"
        }).then((response) => {
            this.data.assets = response.data
            this.data.isLoading = false
        }).catch(error => {
            if (error && error.response && error.response.data.message) {
                this.data.error = error.response.data.message
            }

            this.data.isLoading = false;
        })
    }

    deleteAsset = () => {
        this.data.deleteAsset(this.data.deletionAsset)
        this.data.isShowDeletionDialog = false;
    }

    openDeletionDialog = (asset) => {
        return () => {
            this.data.deletionAsset = asset;
            this.data.isShowDeletionDialog = true
        }
    }

    hideDeletionDialog = () => {
        this.data.isShowDeletionDialog = false
        this.data.deletionAsset = null;
    }

    editAsset = (asset) => {
        return () => {
            this.props.history.push("/dashboard/asset/" + asset.pubId)
        }
    }

    newAsset = () => {
        this.props.history.push("/dashboard/create-asset")
    }

    render() {
        const items = this.data.assets.map((asset) =>
            <tr key={asset.pubId}>
                <td>{asset.name}</td>
                <td>{asset.type}</td>
                <td>{asset.capacity}</td>
                <td className="text-right">
                    <DropdownButton variant="outline-secondary" title="&bull;&bull;&bull;">
                        <Dropdown.Item onClick={this.editAsset(asset)}>Edit</Dropdown.Item>
                        <Dropdown.Item onClick={this.openDeletionDialog(asset)}>Delete</Dropdown.Item>
                    </DropdownButton>
                </td>
            </tr>
        );
        return (
            <div>
                <MainMenu/>

                <h4>Assets ({this.data.assets.length})
                    <Button
                        variant="light"
                        onClick={this.newAsset}
                    > + </Button>
                </h4>
                <Table striped boarder hover >
                    <thead>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Capacity</th>
                    <th/>
                    </thead>
                    <tbody>
                    {this.data.isLoading ?
                        <tr>
                            <td colSpan={3}><Spinner size="sm" animation="grow"/></td>
                        </tr>
                        : items
                    }
                    </tbody>
                </Table>
                <Modal show={this.data.isShowDeletionDialog} onHide={this.hideDeletionDialog}>
                    <Modal.Header closeButton>
                        <Modal.Title>Delete asset</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <p>
                           All bookings will delete with the asset.
                           Are you sure to want to delete it with all bookings?
                        </p>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.hideDeletionDialog}>Not</Button>
                        <Button variant="primary" onClick={this.deleteAsset}>Yes</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}