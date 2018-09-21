import { Observable, from, fromEvent, Subject, asyncScheduler, interval } from 'rxjs';
import { map, filter, reduce, observeOn, flatMap, switchMap, take } from 'rxjs/operators'; // eslint-disable-line

from([1, 2, 3, 4, 5])
	.pipe(
		map(item => item + 10),
		filter(item => item % 2 === 0),
		reduce((total, current) => total + current, 0)
	)
	.subscribe(item => console.log(item));

function getObservableBeer() {
	return Observable.create(observer => {
		const beers = [
			{ name: 'Stella', country: 'Belgium', price: 9.50 },
			{ name: 'Sam Adams', country: 'USA', price: 8.50 },
			{ name: 'Bud Light', country: 'USA', price: 6.50 },
			{ name: 'Brooklyn Lager', country: 'USA', price: 8.00 },
			{ name: 'Sapporo', country: 'Japan', price: 7.50 }
		];

		beers.forEach(beer => observer.next(beer));
		observer.complete();
	});

	// Observable.create(observer => {
	// 	const socket = new WebSocket('ws://beers');
	// 	socket.onmessage = beer => observer.next(beer.data);
	// 	return () => socket.close(); // is invoked on unsubscribe()
	// });
}

getObservableBeer().subscribe(
	val => console.log(`Beer got ${val.name}`),
	err => console.log('error', err),
	() => console.log('The stream is over')
);

////// Subject 1
const subject = new Subject();
const subscriber1 = subject.subscribe(val => console.log(`val1: ${val}`)); // eslint-disable-line
const subscriber2 = subject.subscribe(val => console.log(`val2: ${val}`));

subject.next(true);
subscriber2.unsubscribe();
subject.next(false);

/////// Subject 2
const action = {
	Buy: 'BUY',
	Sell: 'SELL'
};

class Order {
	constructor(orderId, traderId, stock, shares, action) {
		this.orderId = orderId;
		this.traderId = traderId;
		this.stock = stock;
		this.shares = shares;
		this.action = action;
	}
}

const orders = new Subject();

class Trader {
	constructor(traderId, traderName) {} // eslint-disable-line

	placeOrder(order) {
		orders.next(order);
	}
}

const stockExchange = orders.subscribe(order => console.log(`Sending to stock exchange the order to ${order.action} ${order.shares} shares of ${order.stock}`)); // eslint-disable-line
const tradeCommission = orders.subscribe(order => console.log(`Reporting to trade commission the order to ${order.action} ${order.shares} shares of ${order.stock}`)); // eslint-disable-line

const trader = new Trader(1, 'Joe');
const order1 = new Order(1, 1, 'IBM', 100, action.Buy);
const order2 = new Order(2, 1, 'AAPL', 100, action.Sell);

trader.placeOrder(order1);
trader.placeOrder(order2);

// flatMap() 1
function getDrinks() {
	const beers = from([
		{ name: 'Stella', country: 'Belgium', price: 9.50 },
		{ name: 'Sam Adams', country: 'USA', price: 8.50 },
		{ name: 'Bud Light', country: 'USA', price: 6.50 }
	]).pipe(
		observeOn(asyncScheduler)
	);

	const softDrinks = from([
		{ name: 'Coca Cola', country: 'USA', price: 1.50 },
		{ name: 'Fanta', country: 'USA', price: 1.50 },
		{ name: 'Lemonade', country: 'France', price: 2.50 }
	]).pipe(
		observeOn(asyncScheduler)
	);

	return Observable.create(observer => {
		observer.next(beers);
		observer.next(softDrinks);
		observer.complete();
	});
}

getDrinks()
	.pipe(flatMap(drinks => drinks))
	.subscribe(
		drink => console.log('Subscriber got ' + drink.name + ': ' + drink.price),
		error => console.err(error),
		() => console.log('The stream of drinks is over')
	);

// flatMap() 2
const action1 = {
	Buy: 'BUY',
	Sell: 'SELL'
};
const traders1 = new Subject();

class Order1 {
	constructor(orderId, traderId, stock, shares, action) {
		this.orderId = orderId;
		this.traderId = traderId;
		this.stock = stock;
		this.shares = shares;
		this.action = action;
	}
}
class Trader1 {
	constructor(traderId, traderName) {
		this.traderId = traderId;
		this.traderName = traderName;
		this.orders1 = new Subject();
	}
}

const tradersSubscriber1 = traders1.subscribe(trader => console.log(`Trader ${trader.traderName} arrived`)) // eslint-disable-line

const ordersSubscriber1 = traders1  // eslint-disable-line
  .pipe(flatMap(trader => trader.orders1))
  .subscribe(order => console.log(`Got order from trader ${order.traderId} to ${order.action} ${order.shares} shares of ${order.stock}`));

const firstTrader = new Trader1(1, 'Joe');
const secondTrader = new Trader1(2, 'Mary');

traders1.next(firstTrader);
traders1.next(secondTrader);

const order11 = new Order1(1, 1, 'IBM', 100, action1.Buy);
const order22 = new Order1(2, 1, 'AAPL', 200, action1.Sell);
const order33 = new Order1(3, 2, 'MSFT', 500, action1.Buy);

firstTrader.orders1.next(order11);
firstTrader.orders1.next(order22);
secondTrader.orders1.next(order33);

// switchMap 1
const outer$ = interval(1000).pipe(take(2));
const combined$ = outer$.pipe(switchMap(x => {
	return interval(400).pipe(
		take(2),
		map(y => `outer ${x}: inner ${y}`)
	);
}));

combined$.subscribe(result => console.log(`${result}`));

// fromEvent
let click = 0;
document.addEventListener('click', function registerClicks(e) { // eslint-disable-line
	if (click <= 10) {
		if (e.clientX > window.innerWidth / 2) {
			console.log(e.clientX, e.clientY);
			click += 1;
		}
	} else {
		document.removeEventListener('click', registerClicks); // eslint-disable-line
	}
});

fromEvent(document, 'click') // eslint-disable-line
	.pipe(
		filter(e => e.clientX > window.innerWidth / 2),
		take(10)
	)
	.subscribe(e => console.log(e.clientX, e.clientY));



// function obserable(observ, next, done) {
// 	for (const letter of observ) {
// 		next(letter);
// 	}
// 	done();
// }

// obserable('Some', letter => console.log(letter), () => console.log('Done!'));

// class Observable {
// 	constructor(sourse) {
// 		this.sourse = sourse.split('');
// 		this.result = this.sourse;
// 	}

// 	subscribe(next) {
// 		for (const item of this.result) {
// 			next(item);
// 		}
// 	}

// 	filter(predicate) {
// 		this.result = this.result.filter(predicate);
// 		return this;
// 	}

// 	map(callback) {
// 		this.result = this.result.map(callback);
// 		return this;
// 	}
// }

// new Observable('Me')
// 	.map(item => item.toUpperCase())
// 	.filter(item => item === 'E')
// 	.subscribe(item => console.log(item));
