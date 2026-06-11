import { db } from "@emach/db";
import { getReviews, getToolBySlug } from "@emach/db/queries/catalog";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SiteHeader } from "@/components/site-header";

import { ProductGallery } from "./_components/product-gallery";
import { ProductInfo } from "./_components/product-info";
import { ProductJsonLd } from "./_components/product-json-ld";
import { ProductReviews } from "./_components/product-reviews";
import { ProductSpecs } from "./_components/product-specs";
import { RelatedProducts } from "./_components/related-products";
import type { ReviewSortKey } from "./_components/review-sort";

const REVIEWS_PER_PAGE = 10;

export const revalidate = 3600;

interface ProductPageProps {
	params: Promise<{ slug: string }>;
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function parseReviewSort(value: string | string[] | undefined): ReviewSortKey {
	if (value === "rating-desc") {
		return "rating-desc";
	}
	return "newest";
}

function parseReviewPage(value: string | string[] | undefined): number {
	if (typeof value !== "string") {
		return 1;
	}
	const n = Number(value);
	return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

export async function generateMetadata({
	params,
}: ProductPageProps): Promise<Metadata> {
	const { slug } = await params;
	const detail = await getToolBySlug(db, slug);

	if (!detail) {
		return { title: "Produto não encontrado" };
	}

	const title = detail.tool.name;
	const description = detail.tool.description ?? detail.tool.name;
	const ogImage = detail.images[0]?.url;
	return {
		title,
		description,
		openGraph: {
			title,
			description,
			type: "website",
			url: `/product/${detail.tool.slug ?? detail.tool.id}`,
			siteName: "EMACH",
			...(ogImage ? { images: [ogImage] } : {}),
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			...(ogImage ? { images: [ogImage] } : {}),
		},
	};
}

export default async function ProductPage({
	params,
	searchParams,
}: ProductPageProps) {
	const { slug } = await params;
	const sp = await searchParams;
	const detail = await getToolBySlug(db, slug);

	if (!detail) {
		notFound();
	}

	const reviewPage = parseReviewPage(sp.reviewPage);
	const reviewSort = parseReviewSort(sp.reviewSort);

	const reviewsResult = await getReviews(db, {
		toolId: detail.tool.id,
		page: reviewPage,
		limit: REVIEWS_PER_PAGE,
		sort: reviewSort,
	});

	const primaryImageUrl = detail.images[0]?.url ?? null;
	const primaryCategorySlug = detail.primaryCategory?.slug ?? null;
	const primaryCategoryName = detail.primaryCategory?.name ?? null;
	const pathname = `/product/${slug}`;

	return (
		<>
			<ProductJsonLd detail={detail} />
			<SiteHeader />

			<div className="flex flex-row justify-center py-8">
				<ProductGallery
					categorySlug={primaryCategorySlug ?? ""}
					images={detail.images}
					name={detail.tool.name}
				/>
				<ProductInfo
					activePromotion={detail.activePromotion}
					primaryCategoryName={primaryCategoryName}
					primaryCategorySlug={primaryCategorySlug}
					primaryImageUrl={primaryImageUrl}
					reviewStats={detail.reviewStats}
					stockByVariant={detail.stockByVariant}
					tool={detail.tool}
					variants={detail.variants}
				/>
			</div>

			<ProductSpecs
				attributes={detail.attributes}
				categoryName={primaryCategoryName}
				tool={detail.tool}
			/>

			<RelatedProducts
				categoryPath={detail.primaryCategory?.path ?? null}
				toolId={detail.tool.id}
			/>

			{reviewsResult.total > 0 && (
				<ProductReviews
					currentSearchParams={sp}
					page={reviewPage}
					pageSize={REVIEWS_PER_PAGE}
					pathname={pathname}
					reviews={reviewsResult.reviews}
					sort={reviewSort}
					stats={detail.reviewStats}
					total={reviewsResult.total}
				/>
			)}
		</>
	);
}
