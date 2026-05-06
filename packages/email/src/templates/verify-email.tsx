import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Preview,
	Section,
	Text,
} from "@react-email/components";

export interface VerifyEmailProps {
	name: string;
	url: string;
}

const BRAND_RED = "#DA291C";
const NEAR_BLACK = "#181818";

export function VerifyEmailEmail({ name, url }: VerifyEmailProps) {
	return (
		<Html lang="pt-BR">
			<Head />
			<Preview>Confirme seu e-mail na EMACH</Preview>
			<Body
				style={{
					backgroundColor: "#f4f4f4",
					fontFamily: "Barlow, Arial, sans-serif",
					margin: 0,
					padding: 0,
				}}
			>
				<Container
					style={{
						backgroundColor: "#ffffff",
						margin: "40px auto",
						maxWidth: "560px",
						padding: "48px 40px",
					}}
				>
					<Text
						style={{
							color: BRAND_RED,
							fontSize: "14px",
							fontWeight: 700,
							letterSpacing: "2px",
							margin: 0,
							textTransform: "uppercase",
						}}
					>
						EMACH
					</Text>
					<Heading
						style={{
							color: NEAR_BLACK,
							fontSize: "28px",
							fontWeight: 600,
							lineHeight: 1.2,
							margin: "16px 0 8px",
						}}
					>
						Confirme seu e-mail
					</Heading>
					<Text
						style={{
							color: "#444",
							fontSize: "15px",
							lineHeight: 1.6,
							margin: "16px 0",
						}}
					>
						Olá {name}, falta só um passo. Confirme que este e-mail é seu para
						ativar sua conta EMACH.
					</Text>
					<Section style={{ margin: "32px 0" }}>
						<Button
							href={url}
							style={{
								backgroundColor: BRAND_RED,
								color: "#ffffff",
								fontSize: "14px",
								fontWeight: 600,
								padding: "14px 28px",
								textDecoration: "none",
								textTransform: "uppercase",
								letterSpacing: "1px",
							}}
						>
							Confirmar e-mail
						</Button>
					</Section>
					<Text
						style={{
							color: "#666",
							fontSize: "13px",
							lineHeight: 1.6,
							margin: "16px 0",
						}}
					>
						Se você não se cadastrou na EMACH, pode ignorar este e-mail com
						segurança.
					</Text>
					<Hr style={{ borderColor: "#eaeaea", margin: "32px 0" }} />
					<Text
						style={{
							color: "#888",
							fontSize: "12px",
							letterSpacing: "1px",
							margin: 0,
							textTransform: "uppercase",
						}}
					>
						EMACH Ferramentas — Precisão profissional
					</Text>
				</Container>
			</Body>
		</Html>
	);
}

export default VerifyEmailEmail;
