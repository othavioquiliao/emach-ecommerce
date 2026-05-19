import { db } from "@emach/db";
import { getReviews, getToolBySlug } from "@emach/db/queries/catalog";
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

import { ProductGallery } from "./_components/product-gallery";
import { ProductInfo } from "./_components/product-info";
import { ProductReviews } from "./_components/product-reviews";
import { ProductTabs } from "./_components/product-tabs";
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
		return { title: "Produto não encontrado — EMACH" };
	}

	const title = `${detail.tool.name} — EMACH`;
	const description = detail.tool.description ?? detail.tool.name;
	return {
		title,
		description,
		openGraph: {
			title,
			description,
			type: "website",
			url: `/product/${detail.tool.slug ?? detail.tool.id}`,
			siteName: "EMACH",
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
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
			<SiteHeader />

			<div className="border-border border-b px-20 py-4">
				<Breadcrumb>
					<BreadcrumbList>
						<BreadcrumbItem>
							<BreadcrumbLink render={<Link href="/" />}>Home</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						{primaryCategorySlug && primaryCategoryName && (
							<>
								<BreadcrumbItem>
									<BreadcrumbLink
										render={
											<Link href={`/catalog?cat=${primaryCategorySlug}`} />
										}
									>
										{primaryCategoryName}
									</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator />
							</>
						)}
						<BreadcrumbItem>
							<BreadcrumbPage>{detail.tool.name}</BreadcrumbPage>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>
			</div>

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

			<ProductTabs attributes={detail.attributes} tool={detail.tool} />
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
			<RelatedProducts
				categoryPath={detail.primaryCategory?.path ?? null}
				toolId={detail.tool.id}
			/>
			<SiteFooter />
		</>
	);
}
