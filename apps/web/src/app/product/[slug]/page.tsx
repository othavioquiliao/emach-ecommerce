import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@emach/ui/components/breadcrumb";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getProductBySlug, products } from "@/lib/mock-data";

import { ProductGallery } from "./_components/product-gallery";
import { ProductInfo } from "./_components/product-info";
import { ProductTabs } from "./_components/product-tabs";
import { RelatedProducts } from "./_components/related-products";

interface ProductPageProps {
	params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
	return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
	params,
}: ProductPageProps): Promise<Metadata> {
	const { slug } = await params;
	const product = getProductBySlug(slug);

	if (!product) {
		return { title: "Produto não encontrado — EMACH" };
	}

	const title = `${product.name} — EMACH`;
	return {
		title,
		description: product.shortDescription,
		openGraph: {
			title,
			description: product.shortDescription,
			type: "website",
			url: `/product/${product.slug}`,
			siteName: "EMACH",
		},
		twitter: {
			card: "summary_large_image",
			title,
			description: product.shortDescription,
		},
	};
}

export default async function ProductPage({ params }: ProductPageProps) {
	const { slug } = await params;
	const product = getProductBySlug(slug);

	if (!product) {
		notFound();
	}

	const relatedProducts = products
		.filter(
			(p) => p.categorySlug === product.categorySlug && p.id !== product.id
		)
		.slice(0, 4);

	return (
		<>
			<SiteHeader />

			{/* Breadcrumb bar */}
			<div className="border-border border-b px-20 py-4">
				<Breadcrumb>
					<BreadcrumbList>
						<BreadcrumbItem>
							<BreadcrumbLink render={<Link href="/" />}>Home</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbLink
								render={<Link href={`/catalog?cat=${product.categorySlug}`} />}
							>
								{product.category}
							</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbPage>{product.name}</BreadcrumbPage>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>
			</div>

			{/* Main product section */}
			<div className="flex flex-row gap-15 px-20 py-8">
				<ProductGallery
					categorySlug={product.categorySlug}
					images={product.images}
					name={product.name}
				/>
				<ProductInfo product={product} />
			</div>

			<ProductTabs product={product} />
			<RelatedProducts products={relatedProducts} />
			<SiteFooter />
		</>
	);
}
