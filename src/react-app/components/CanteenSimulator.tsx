import React, { useState } from "react";
import { ShoppingCartIcon, DatabaseIcon, CheckIcon, TrashIcon } from "../assets/icons";

interface Product {
	id: string;
	name: string;
	price: number;
	category: string;
	stock: number;
}

interface CartItem {
	product: Product;
	quantity: number;
}

interface Order {
	id: string;
	items: CartItem[];
	total: number;
	payment: "Cash" | "Card";
	status: "Pending" | "Completed";
	time: string;
}

export const CanteenSimulator: React.FC = () => {
	// Sample products
	const [products, setProducts] = useState<Product[]>([
		{ id: "1", name: "Club Sandwich", price: 3.5, category: "Meals", stock: 15 },
		{ id: "2", name: "Croissant", price: 2.0, category: "Bakery", stock: 8 },
		{ id: "3", name: "Watermelon Salad", price: 2.5, category: "Salads", stock: 12 },
		{ id: "4", name: "Apple Juice", price: 1.5, category: "Drinks", stock: 20 },
		{ id: "5", name: "Double Espresso", price: 2.2, category: "Drinks", stock: 25 },
	]);

	const [cart, setCart] = useState<CartItem[]>([]);
	const [orders, setOrders] = useState<Order[]>([
		{
			id: "ORD-081",
			items: [
				{ product: { id: "1", name: "Club Sandwich", price: 3.5, category: "Meals", stock: 15 }, quantity: 2 },
				{ product: { id: "4", name: "Apple Juice", price: 1.5, category: "Drinks", stock: 20 }, quantity: 1 }
			],
			total: 8.5,
			payment: "Card",
			status: "Pending",
			time: "2 mins ago"
		}
	]);
	const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Card">("Cash");
	const [activeTab, setActiveTab] = useState<"student" | "admin">("student");
	const [alertMessage, setAlertMessage] = useState<string | null>(null);

	const addToCart = (product: Product) => {
		if (product.stock <= 0) {
			showAlert("Item is out of stock!");
			return;
		}

		setCart((prevCart) => {
			const existing = prevCart.find((item) => item.product.id === product.id);
			if (existing) {
				if (existing.quantity >= product.stock) {
					showAlert("Cannot add more, stock limit reached!");
					return prevCart;
				}
				return prevCart.map((item) =>
					item.product.id === product.id
						? { ...item, quantity: item.quantity + 1 }
						: item
				);
			}
			return [...prevCart, { product, quantity: 1 }];
		});
	};

	const updateCartQuantity = (productId: string, delta: number) => {
		setCart((prevCart) => {
			return prevCart
				.map((item) => {
					if (item.product.id === productId) {
						const newQty = item.quantity + delta;
						if (newQty <= 0) return null;
						if (newQty > item.product.stock) {
							showAlert("Stock limit reached!");
							return item;
						}
						return { ...item, quantity: newQty };
					}
					return item;
				})
				.filter(Boolean) as CartItem[];
		});
	};

	const removeFromCart = (productId: string) => {
		setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
	};

	const showAlert = (msg: string) => {
		setAlertMessage(msg);
		setTimeout(() => setAlertMessage(null), 3000);
	};

	const handleCheckout = () => {
		if (cart.length === 0) {
			showAlert("Your cart is empty!");
			return;
		}

		const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

		// Create order
		const newOrder: Order = {
			id: `ORD-${Math.floor(100 + Math.random() * 900)}`, // eslint-disable-line react-hooks/purity
			items: [...cart],
			total: parseFloat(total.toFixed(2)),
			payment: paymentMethod,
			status: "Pending",
			time: "Just now"
		};

		// Update stocks
		setProducts((prevProducts) =>
			prevProducts.map((p) => {
				const cartItem = cart.find((c) => c.product.id === p.id);
				if (cartItem) {
					return { ...p, stock: p.stock - cartItem.quantity };
				}
				return p;
			})
		);

		setOrders((prevOrders) => [newOrder, ...prevOrders]);
		setCart([]);
		showAlert("Order placed successfully! Switch to the Admin Panel tab to manage it.");
	};

	const completeOrder = (orderId: string) => {
		setOrders((prevOrders) =>
			prevOrders.map((o) => (o.id === orderId ? { ...o, status: "Completed" as const } : o))
		);
	};

	const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
	const tax = subtotal * 0.14; // 14% VAT in Egypt
	const total = subtotal + tax;

	return (
		<div className="simulator-container">
			{/* Simulator Header */}
			<div className="sim-nav">
				<button
					className={`sim-nav-btn ${activeTab === "student" ? "active" : ""}`}
					onClick={() => setActiveTab("student")}
				>
					<ShoppingCartIcon size={16} />
					<span>Student Interface</span>
				</button>
				<button
					className={`sim-nav-btn ${activeTab === "admin" ? "active" : ""}`}
					onClick={() => setActiveTab("admin")}
				>
					<DatabaseIcon size={16} />
					<span>Admin Dashboard</span>
					{orders.filter((o) => o.status === "Pending").length > 0 && (
						<span className="badge">
							{orders.filter((o) => o.status === "Pending").length}
						</span>
					)}
				</button>
			</div>

			{/* Alert Message */}
			{alertMessage && <div className="sim-alert">{alertMessage}</div>}

			{/* Content Area */}
			<div className="sim-content">
				{activeTab === "student" ? (
					<div className="student-grid">
						{/* Menu list */}
						<div className="menu-section">
							<h4 className="section-title">Cafeteria Menu</h4>
							<div className="menu-cards">
								{products.map((product) => (
									<div key={product.id} className="menu-card">
										<div className="menu-card-header">
											<span className="category-tag">{product.category}</span>
											<span className={`stock-tag ${product.stock < 5 ? "low" : ""}`}>
												{product.stock > 0 ? `${product.stock} left` : "Out of stock"}
											</span>
										</div>
										<h5 className="product-name">{product.name}</h5>
										<div className="menu-card-footer">
											<span className="price">${product.price.toFixed(2)}</span>
											<button
												className="add-to-cart-btn"
												onClick={() => addToCart(product)}
												disabled={product.stock <= 0}
											>
												Add
											</button>
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Shopping Cart */}
						<div className="cart-section">
							<h4 className="section-title">My Cart</h4>
							{cart.length === 0 ? (
								<div className="empty-cart">
									<ShoppingCartIcon size={36} className="empty-cart-icon" />
									<p>Your cart is empty. Add items from the menu!</p>
								</div>
							) : (
								<div className="cart-container">
									<div className="cart-items">
										{cart.map((item) => (
											<div key={item.product.id} className="cart-item">
												<div className="item-info">
													<span className="item-name">{item.product.name}</span>
													<span className="item-price">
														${(item.product.price * item.quantity).toFixed(2)}
													</span>
												</div>
												<div className="item-controls">
													<button
														className="qty-btn"
														onClick={() => updateCartQuantity(item.product.id, -1)}
													>
														-
													</button>
													<span className="qty">{item.quantity}</span>
													<button
														className="qty-btn"
														onClick={() => updateCartQuantity(item.product.id, 1)}
													>
														+
													</button>
													<button
														className="delete-btn"
														onClick={() => removeFromCart(item.product.id)}
														title="Remove item"
													>
														<TrashIcon size={14} />
													</button>
												</div>
											</div>
										))}
									</div>

									{/* Checkout actions */}
									<div className="checkout-summary">
										<div className="summary-row">
											<span>Subtotal</span>
											<span>${subtotal.toFixed(2)}</span>
										</div>
										<div className="summary-row">
											<span>VAT (Egypt 14%)</span>
											<span>${tax.toFixed(2)}</span>
										</div>
										<div className="summary-row total-row">
											<span>Total</span>
											<span>${total.toFixed(2)}</span>
										</div>

										<div className="payment-select">
											<span>Payment:</span>
											<div className="payment-options">
												<button
													className={`pay-opt ${paymentMethod === "Cash" ? "selected" : ""}`}
													onClick={() => setPaymentMethod("Cash")}
												>
													Cash
												</button>
												<button
													className={`pay-opt ${paymentMethod === "Card" ? "selected" : ""}`}
													onClick={() => setPaymentMethod("Card")}
												>
													Card
												</button>
											</div>
										</div>

										<button className="checkout-btn" onClick={handleCheckout}>
											Place Order
										</button>
									</div>
								</div>
							)}
						</div>
					</div>
				) : (
					<div className="admin-grid">
						{/* Orders Queue */}
						<div className="orders-queue-section">
							<h4 className="section-title">Active Orders (Live Queue)</h4>
							{orders.length === 0 ? (
								<div className="no-orders">
									<p>No orders yet. Place some orders from the Student tab!</p>
								</div>
							) : (
								<div className="orders-list">
									{orders.map((order) => (
										<div key={order.id} className={`order-card ${order.status.toLowerCase()}`}>
											<div className="order-header">
												<span className="order-id">{order.id}</span>
												<span className="order-time">{order.time}</span>
											</div>
											<div className="order-items-list">
												{order.items.map((item) => (
													<div key={item.product.id} className="order-item-row">
														<span>{item.product.name}</span>
														<span>x{item.quantity}</span>
													</div>
												))}
											</div>
											<div className="order-footer">
												<div className="order-totals">
													<span className="total-label">Total:</span>
													<span className="total-val">${order.total.toFixed(2)}</span>
													<span className="pay-badge">{order.payment}</span>
												</div>
												{order.status === "Pending" ? (
													<button
														className="complete-btn"
														onClick={() => completeOrder(order.id)}
													>
														Complete
													</button>
												) : (
													<span className="completed-badge">
														<CheckIcon size={12} /> Completed
													</span>
												)}
											</div>
										</div>
									))}
								</div>
							)}
						</div>

						{/* Admin Stats and Analytics Mockup */}
						<div className="admin-stats-section">
							<h4 className="section-title">Today's Canteen Analytics</h4>

							<div className="stats-cards-grid">
								<div className="stat-card">
									<span className="stat-label">Total Sales</span>
									<span className="stat-value">
										$
										{orders
											.reduce((sum, o) => sum + (o.status === "Completed" ? o.total : 0), 0)
											.toFixed(2)}
									</span>
								</div>
								<div className="stat-card">
									<span className="stat-label">Active Orders</span>
									<span className="stat-value">
										{orders.filter((o) => o.status === "Pending").length}
									</span>
								</div>
								<div className="stat-card">
									<span className="stat-label">Total Orders</span>
									<span className="stat-value">{orders.length}</span>
								</div>
							</div>

							<div className="chart-container-mock">
								<span className="chart-title">Real-Time Revenue Chart</span>
								<div className="bar-chart-mock">
									<div className="bar-col">
										<div className="bar-fill" style={{ height: "40%" }}>
											<span className="bar-tooltip">$12.50</span>
										</div>
										<span className="bar-label">09:00</span>
									</div>
									<div className="bar-col">
										<div className="bar-fill" style={{ height: "65%" }}>
											<span className="bar-tooltip">$24.00</span>
										</div>
										<span className="bar-label">10:00</span>
									</div>
									<div className="bar-col">
										<div className="bar-fill" style={{ height: "95%" }}>
											<span className="bar-tooltip">$48.50</span>
										</div>
										<span className="bar-label">11:00</span>
									</div>
									<div className="bar-col">
										<div className="bar-fill" style={{ height: "55%" }}>
											<span className="bar-tooltip">$18.20</span>
										</div>
										<span className="bar-label">12:00</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
