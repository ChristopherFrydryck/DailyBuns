import {observable, computed, action} from 'mobx'

var today = new Date();

class UserStore {
    @observable userID = '';
    @observable fullname = '';
    @observable email = '';
    @observable phone = '';
    @observable password = '';
    @observable photo = '';
    @observable joinedDate = null;
    @observable favorites = [];
    @observable searchHistory = [];
    @observable viewed = [];

    @observable signInProvider = "";


    @computed get firstname() {
        return this.fullname.split(' ', 1).toString();
    }

    @computed get lastname() {
        return this.fullname.split(' ').slice(-1).join();
    }

    // @computed get monthJoined() {
    //     return this.joinedDate.getMonth();
    // }


}

export default new UserStore();