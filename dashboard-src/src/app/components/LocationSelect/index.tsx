import * as React from "react";
import {observer} from "mobx-react";
import {LOCATION_STORE} from "app/store/LocationStore";
import Select from 'react-select'

@observer
export class LocationSelect extends React.Component<any, any> {
    private store = LOCATION_STORE

    selectLocation(pubId: String) {
        this.store.selectLocation(pubId)
    }

    render() {
        return (
            <Select
                value={this.store.selectedLocation && {
                    label: this.store.selectedLocation.name,
                    value: this.store.selectedLocation.pubId
                }}
                options={this.store.locations.map(l => ({"label": l.name, "value": l.pubId}))}
                onChange={e => this.selectLocation(e.value)}
            />
        );
    }
}