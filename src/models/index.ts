import { User } from './User';
import { Customer } from './Customer';
import { Menu } from './Menu';
import { MenuItem } from './MenuItem';
import { Order } from './Order';
import { OrderHistory } from './OrderHistory';
import { OrderItem } from './OrderItem';
import { Restaurant } from './Restaurant';

// restaurant.belongsTo(User, {foreignKey: 'fk_User'});


export const Models = [ User , Customer , Menu , MenuItem , Order , OrderHistory , OrderItem , Restaurant ];
