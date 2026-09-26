import { OrderCustomer } from "themelia-ui/admin/patterns/commerce"
import { Grid, GridCell } from "themelia-ui/base/structure"

export default function OrderCustomerExample() {
	return (
		<Grid columns={{ base: 1, md: 2 }} gap="xl">
			<GridCell>
				<OrderCustomer
					name="Alice Mercer"
					email="alice.mercer@example.test"
					phone="+44 20 7946 0102"
					orderCount={4}
					shippingAddress={{
						name: "Alice Mercer",
						line1: "14 Kingsway",
						line2: "Flat 3",
						city: "London",
						postalCode: "WC2B 6UF",
						country: "United Kingdom",
					}}
					billingSameAsShipping
					onOpenCustomer={() => {}}
					onEditShipping={() => {}}
				/>
			</GridCell>
			<GridCell>
				<OrderCustomer
					name="Adventure Park Bansko"
					email="ops@bansko.example"
					orderCount={1}
					shippingAddress={{
						line1: "Pirin Street 71",
						city: "Bansko",
						region: "Blagoevgrad",
						postalCode: "2770",
						country: "Bulgaria",
					}}
					billingAddress={{
						line1: "Bul Bulgaria 111",
						city: "Sofia",
						postalCode: "1404",
						country: "Bulgaria",
					}}
					onEditShipping={() => {}}
					onEditBilling={() => {}}
				/>
			</GridCell>
		</Grid>
	)
}
