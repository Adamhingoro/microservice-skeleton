import { User } from './User';
import { Customer } from './Customer';
import { Menu } from './Menu';
import { MenuItem } from './MenuItem';
import { Order } from './Order';
import { OrderHistory } from './OrderHistory';
import { OrderItem } from './OrderItem';
import { Restaurent } from './Restaurent';

// Restaurent.belongsTo(User, {foreignKey: 'fk_User'});


export const Models = [ User , Customer , Menu , MenuItem , Order , OrderHistory , OrderItem , Restaurent ];
