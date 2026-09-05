import {CartContent} from "@/components/cart-content";
import {StorefrontHeader} from "@/components/storefront-header";
export default function CartPage(){return <main className="jumia-market-page"><StorefrontHeader/><div className="jumia-market-wrap"><div className="jumia-breadcrumb"><a href="/shop">Home</a><span>›</span> Cart</div><div className="jumia-page-title-row"><h1>Cart</h1><span>Review your selected bags</span></div><CartContent/></div></main>}
