"""Dossier client NEVIE-GLOBAL UK — PDF professionnel en français."""
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    Image as RLImage,
    KeepTogether,
    ListFlowable,
    ListItem,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

OUT = Path(__file__).resolve().parent / "NEVIE-GLOBAL-UK-Dossier-Client-FR.pdf"
SCREENS = Path(__file__).resolve().parent / "screens"
FONTS = Path(r"C:\Windows\Fonts")

pdfmetrics.registerFont(TTFont("Body", str(FONTS / "segoeui.ttf")))
pdfmetrics.registerFont(TTFont("BodyBold", str(FONTS / "segoeuib.ttf")))
pdfmetrics.registerFont(TTFont("BodyLight", str(FONTS / "segoeuil.ttf")))

ELECTRIC = colors.HexColor("#00A9FF")
GOLD = colors.HexColor("#FFD47A")
CARBON = colors.HexColor("#1A1A1A")
BLACK = colors.HexColor("#000000")
INK = colors.HexColor("#14262F")
MUTED = colors.HexColor("#4D6571")
LINE = colors.HexColor("#D5E1E7")
PAPER = colors.HexColor("#F4F7F9")
WHITE = colors.white
LIVE = colors.HexColor("#0B6E4F")
PREVIEW = colors.HexColor("#8A5A00")
TODO = colors.HexColor("#B42318")

W, H = A4


def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(BLACK)
    canvas.rect(0, H - 14 * mm, W, 14 * mm, fill=1, stroke=0)
    canvas.setFillColor(ELECTRIC)
    canvas.rect(0, H - 14 * mm, W, 1.2, fill=1, stroke=0)
    canvas.setFillColor(WHITE)
    canvas.setFont("Body", 8)
    canvas.drawString(18 * mm, H - 8.6 * mm, "NEVIE-GLOBAL  ·  UNITED KINGDOM")
    canvas.setFillColor(GOLD)
    canvas.setFont("Body", 8)
    canvas.drawRightString(W - 18 * mm, H - 8.6 * mm, "Dossier client  ·  confidentiel")
    canvas.setFillColor(PAPER)
    canvas.rect(0, 0, W, 12 * mm, fill=1, stroke=0)
    canvas.setFillColor(ELECTRIC)
    canvas.rect(0, 12 * mm, W, 1, fill=1, stroke=0)
    canvas.setFillColor(MUTED)
    canvas.setFont("Body", 8)
    canvas.drawString(18 * mm, 5 * mm, "Revue de plateforme  ·  septembre 2026")
    canvas.drawRightString(W - 18 * mm, 5 * mm, f"{doc.page}")
    canvas.restoreState()


def cover_page(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(BLACK)
    canvas.rect(0, 0, W, H, fill=1, stroke=0)
    canvas.setFillColor(ELECTRIC)
    canvas.rect(0, 0, 6, H, fill=1, stroke=0)
    canvas.setFillColor(colors.HexColor("#021018"))
    canvas.circle(W + 40, -20, 220, fill=1, stroke=0)
    canvas.setFillColor(GOLD)
    canvas.setFont("Body", 9)
    canvas.drawString(22 * mm, H - 28 * mm, "NEVIE-GLOBAL  /  UK")
    canvas.setFillColor(WHITE)
    canvas.setFont("BodyLight", 28)
    canvas.drawString(22 * mm, H - 52 * mm, "Dossier de présentation")
    canvas.setFont("BodyBold", 32)
    canvas.drawString(22 * mm, H - 68 * mm, "Plateforme commerciale")
    canvas.setFillColor(ELECTRIC)
    canvas.setFont("BodyBold", 32)
    canvas.drawString(22 * mm, H - 82 * mm, "NEVIE-GLOBAL UK")
    canvas.setStrokeColor(ELECTRIC)
    canvas.setLineWidth(1.2)
    canvas.line(22 * mm, H - 92 * mm, 92 * mm, H - 92 * mm)
    canvas.setFillColor(colors.HexColor("#C5D7E0"))
    canvas.setFont("Body", 11)
    text = canvas.beginText(22 * mm, H - 108 * mm)
    text.setLeading(16)
    for line in [
        "Revue section par section à destination du client.",
        "Ce document explique ce qui est déjà en place dans le design,",
        "ce que chaque page fait aujourd’hui, et les contenus encore à fournir",
        "avant un lancement commercial (textes, preuves, légal, paiements).",
    ]:
        text.textLine(line)
    canvas.drawText(text)
    y = 78 * mm
    for label, value in [
        ("Nature", "Aperçu frontend — pas encore d’achat réel"),
        ("Thèmes", "Mode sombre et mode clair opérationnels"),
        ("Marché", "Royaume-Uni  ·  langue d’interface EN-GB  ·  prix en GBP"),
        ("Date", "21 septembre 2026"),
    ]:
        canvas.setFillColor(GOLD)
        canvas.setFont("Body", 8)
        canvas.drawString(22 * mm, y + 12, label.upper())
        canvas.setFillColor(WHITE)
        canvas.setFont("Body", 11)
        canvas.drawString(22 * mm, y, value)
        y -= 18 * mm
    canvas.setFillColor(MUTED)
    canvas.setFont("Body", 8)
    canvas.drawString(22 * mm, 16 * mm, "Document interne de revue. Aucune offre d’investissement ni de vente n’est formulée ici.")
    canvas.restoreState()


styles = getSampleStyleSheet()
styles.add(
    ParagraphStyle(
        "H1",
        fontName="BodyBold",
        fontSize=18,
        leading=22,
        textColor=INK,
        spaceAfter=10,
        spaceBefore=4,
    )
)
styles.add(
    ParagraphStyle(
        "H2",
        fontName="BodyBold",
        fontSize=13,
        leading=17,
        textColor=INK,
        spaceBefore=12,
        spaceAfter=6,
    )
)
styles.add(
    ParagraphStyle(
        "Lead",
        fontName="Body",
        fontSize=10.5,
        leading=15.5,
        textColor=MUTED,
        spaceAfter=10,
        alignment=TA_JUSTIFY,
    )
)
styles.add(
    ParagraphStyle(
        "BodyText2",
        fontName="Body",
        fontSize=9.5,
        leading=14,
        textColor=INK,
        spaceAfter=7,
        alignment=TA_JUSTIFY,
    )
)
styles.add(
    ParagraphStyle(
        "Caption",
        fontName="Body",
        fontSize=8,
        leading=11,
        textColor=MUTED,
        spaceAfter=8,
    )
)
styles.add(
    ParagraphStyle(
        "Cell",
        fontName="Body",
        fontSize=8,
        leading=11.2,
        textColor=INK,
    )
)
styles.add(
    ParagraphStyle(
        "CellHead",
        fontName="BodyBold",
        fontSize=8,
        leading=11,
        textColor=WHITE,
    )
)
styles.add(
    ParagraphStyle(
        "StatusLive",
        fontName="BodyBold",
        fontSize=8,
        textColor=LIVE,
    )
)
styles.add(
    ParagraphStyle(
        "StatusPreview",
        fontName="BodyBold",
        fontSize=8,
        textColor=PREVIEW,
    )
)
styles.add(
    ParagraphStyle(
        "StatusTodo",
        fontName="BodyBold",
        fontSize=8,
        textColor=TODO,
    )
)
styles.add(
    ParagraphStyle(
        "BulletBody",
        fontName="Body",
        fontSize=9.5,
        leading=13.5,
        textColor=INK,
    )
)


def screen_block(stem, title, note):
    path = SCREENS / f"{stem}.jpg"
    if not path.exists():
        return [P(f"<i>Capture non disponible pour {title}.</i>")]
    width = 176 * mm
    height = width * 900 / 1440
    image = RLImage(str(path), width=width, height=height)
    frame = Table([[image]], colWidths=[width])
    frame.setStyle(
        TableStyle(
            [
                ("BOX", (0, 0), (-1, -1), 0.7, CARBON),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
                ("BACKGROUND", (0, 0), (-1, -1), BLACK),
            ]
        )
    )
    return [
        KeepTogether(
            [
                P(title, "H2"),
                P(note),
                frame,
                Spacer(1, 8),
            ]
        )
    ]


GALLERY = [
    ("home-dark", "Accueil — mode sombre", "Héro mosaïque, shop bar, annonce. Thème dark déjà opérationnel."),
    ("home-light", "Accueil — mode clair", "Même structure en ice-white. Contraste du logo et des CTA à valider."),
    ("marketplace", "Marketplace — landing", "Collections d’abord, pas tout le catalogue. Featured fondateur + catégories."),
    ("category-jewellery", "Catégorie Connected jewellery", "Filtre actif, 6 bijoux, prix en GBP, sidebar d’aide."),
    ("category-founder", "Catégorie Founder access", "Carte Fondateur et Coffret Fondateur uniquement."),
    ("product", "Fiche produit — Bague Aura", "Galerie, achat, sauvegarde, spécifications. Avis encore vides."),
    ("cart", "Panier", "Aperçu bag. Le paiement n’est pas ouvert."),
    ("academy", "Academy — catalogue", "Parcours d’apprentissage et tableau de progression local."),
    ("academy-course", "Academy — leçon", "Contenu de cours. Vidéos / quiz encore à fournir."),
    ("services", "Services — vue d’ensemble", "Portefeuille de capacités. Textes encore génériques."),
    ("ai", "Service — Artificial Intelligence", "Page capacité type (titre, process, cartes)."),
    ("solutions", "Solutions", "Grille d’enjeux business, pas encore de preuves clients."),
    ("industries", "Industries", "Secteurs cibles. Pages profondes et cas à écrire."),
    ("pricing", "Pricing", "Discovery / Build / Evolve. Pas de grille tarifaire services."),
    ("about", "About", "Présentation société. Équipe, photos, entité légale à livrer."),
    ("contact", "Contact", "Formulaire visible, service d’envoi pas encore connecté."),
    ("faq", "FAQ", "4 questions preview. FAQ commerce complète à rédiger."),
    ("blog", "Blog / Insights", "3 articles de fond. Calendrier éditorial à décider."),
    ("support", "Support", "Portail d’aide. SLA et tickets réels à brancher."),
    ("documentation", "Documentation", "Explique le mode preview. Docs produits live plus tard."),
    ("partners", "Partners", "Placeholder partenaires — noms après accords."),
    ("privacy", "Privacy / Légal", "Texte pré-lancement. Passe avocat UK obligatoire."),
    ("sign-in", "Connexion", "Écran auth, chrome site masqué. Auth réelle à connecter."),
    ("sign-up", "Création de compte", "Même langage visuel que le sign-in."),
    ("dashboard", "Espace client — Home", "KPI et activité en données de démonstration."),
    ("dashboard-projects", "Espace client — Projects", "Workspace de livraison. Pas encore lié à un outil réel."),
    ("admin", "Console admin — Overview", "Pilotage interne. Chiffres fictifs, à ne pas présenter comme live."),
]


def P(text, style="BodyText2"):
    return Paragraph(text, styles[style])


def status(kind):
    return {
        "live": Paragraph("En place", styles["StatusLive"]),
        "preview": Paragraph("Aperçu", styles["StatusPreview"]),
        "todo": Paragraph("À fournir", styles["StatusTodo"]),
    }[kind]


def section_table(rows):
    head = [
        Paragraph("Section", styles["CellHead"]),
        Paragraph("Ce qui se passe", styles["CellHead"]),
        Paragraph("Design / UX", styles["CellHead"]),
        Paragraph("Contenu à écrire ou ajouter", styles["CellHead"]),
        Paragraph("Statut", styles["CellHead"]),
    ]
    data = [head]
    for title, happens, design, content, kind in rows:
        data.append(
            [
                Paragraph(title, styles["Cell"]),
                Paragraph(happens, styles["Cell"]),
                Paragraph(design, styles["Cell"]),
                Paragraph(content, styles["Cell"]),
                status(kind),
            ]
        )
    table = Table(data, colWidths=[32 * mm, 38 * mm, 38 * mm, 48 * mm, 22 * mm], repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), CARBON),
                ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
                ("BACKGROUND", (0, 1), (-1, -1), WHITE),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, PAPER]),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("GRID", (0, 0), (-1, -1), 0.3, LINE),
                ("BOX", (0, 0), (-1, -1), 0.6, CARBON),
            ]
        )
    )
    return table


def bullets(items):
    return ListFlowable(
        [ListItem(Paragraph(item, styles["BulletBody"]), leftIndent=8, bulletColor=ELECTRIC) for item in items],
        bulletType="bullet",
        start="•",
        leftIndent=12,
        bulletFontName="BodyBold",
        bulletFontSize=9,
        spaceAfter=8,
    )


story = []
story.append(PageBreak())

# Page 2 starts after cover (cover drawn on page 1 via onFirstPage)
story.append(P("1. Comment lire ce dossier", "H1"))
story.append(
    P(
        "Ce PDF est un outil de revue pour le client. Il ne remplace pas le site : il décrit, page par page, "
        "l’intention, le design déjà construit, et les éléments encore manquants. Trois statuts sont utilisés partout."
    )
)
legend = Table(
    [
        [
            Paragraph("<b>En place</b>", styles["Cell"]),
            Paragraph("Interface construite et navigable. Le visiteur peut déjà voir et cliquer.", styles["Cell"]),
        ],
        [
            Paragraph("<b>Aperçu</b>", styles["Cell"]),
            Paragraph(
                "L’écran existe, mais les données sont de démonstration, le paiement n’est pas actif, ou le texte reste générique.",
                styles["Cell"],
            ),
        ],
        [
            Paragraph("<b>À fournir</b>", styles["Cell"]),
            Paragraph(
                "Le client (ou le juridique / marketing) doit livrer un contenu réel : textes, photos, preuves, mentions légales, tarifs, partenaires.",
                styles["Cell"],
            ),
        ],
    ],
    colWidths=[32 * mm, 146 * mm],
)
legend.setStyle(
    TableStyle(
        [
            ("BACKGROUND", (0, 0), (0, 0), colors.HexColor("#E8F6EF")),
            ("BACKGROUND", (0, 1), (0, 1), colors.HexColor("#FFF6E5")),
            ("BACKGROUND", (0, 2), (0, 2), colors.HexColor("#FDECEC")),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ("TOPPADDING", (0, 0), (-1, -1), 7),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
            ("BOX", (0, 0), (-1, -1), 0.4, LINE),
            ("INNERGRID", (0, 0), (-1, -1), 0.3, LINE),
        ]
    )
)
story.append(legend)
story.append(Spacer(1, 8))
story.append(
    P(
        "La plateforme actuelle est un <b>front-end de prévisualisation</b> pour le Royaume-Uni. "
        "Le panier, la liste d’envies et la progression Academy restent dans le navigateur. "
        "Aucun paiement n’est encaissé. Les formulaires de contact et newsletter sont préparés mais pas encore connectés. "
        "Les captures d’écran réelles de chaque page sont dans l’annexe visuelle, à la fin de ce dossier."
    )
)

story.append(P("2. Système de design", "H1"))
story.append(
    P(
        "L’identité visuelle suit une direction entreprise (références de densité : OpenAI, Stripe, Linear) "
        "sans copier ces marques. Le logo officiel n’a pas été modifié."
    )
)

palette = Table(
    [
        [Paragraph("Jeton", styles["CellHead"]), Paragraph("Code", styles["CellHead"]), Paragraph("Usage", styles["CellHead"])],
        [Paragraph("Electric Blue", styles["Cell"]), Paragraph("#00A9FF", styles["Cell"]), Paragraph("Actions, liens, focus, loader, accents d’interface", styles["Cell"])],
        [Paragraph("Premium Gold", styles["Cell"]), Paragraph("#FFD47A", styles["Cell"]), Paragraph("Surbrillance rare, barre de progression, détails premium", styles["Cell"])],
        [Paragraph("Laser Red", styles["Cell"]), Paragraph("#FF0000", styles["Cell"]), Paragraph("Accents d’alerte uniquement — jamais comme couleur principale", styles["Cell"])],
        [Paragraph("Carbon / Black", styles["Cell"]), Paragraph("#1A1A1A / #000000", styles["Cell"]), Paragraph("Fonds sombres, header de documents, splash loader", styles["Cell"])],
        [Paragraph("White / Ice", styles["Cell"]), Paragraph("#FFFFFF / #F3F6FA", styles["Cell"]), Paragraph("Mode clair, cartes, surfaces de lecture", styles["Cell"])],
    ],
    colWidths=[40 * mm, 42 * mm, 96 * mm],
)
palette.setStyle(
    TableStyle(
        [
            ("BACKGROUND", (0, 0), (-1, 0), CARBON),
            ("BACKGROUND", (0, 1), (0, 1), ELECTRIC),
            ("TEXTCOLOR", (0, 1), (0, 1), WHITE),
            ("BACKGROUND", (0, 2), (0, 2), GOLD),
            ("BACKGROUND", (0, 3), (0, 3), colors.HexColor("#FF0000")),
            ("TEXTCOLOR", (0, 3), (0, 3), WHITE),
            ("BACKGROUND", (0, 4), (0, 4), CARBON),
            ("TEXTCOLOR", (0, 4), (0, 4), WHITE),
            ("BACKGROUND", (0, 5), (0, 5), WHITE),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LEFTPADDING", (0, 0), (-1, -1), 7),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("GRID", (0, 0), (-1, -1), 0.3, LINE),
        ]
    )
)
story.append(palette)
story.append(Spacer(1, 8))
story.append(P("Langage visuel déjà appliqué", "H2"))
story.append(
    bullets(
        [
            "<b>Typographie</b> : titraille condensée et technique, corps lisible, tracking serré sur les grands titres.",
            "<b>Rayons</b> : cartes 12–24 px, boutons nets, hero en mosaïque arrondie.",
            "<b>Interdits</b> : pas de vert dans l’UI, pas de surcharge d’illustrations clip-art.",
            "<b>Images produits</b> : catalogue bijouterie connectée + accès fondateur. Les fichiers source NEVIE doivent rester dans /public/products.",
            "<b>Devise</b> : affichage GBP (£) pour le marché UK. Les anciens prix EUR du site source restent à valider commercialement.",
        ]
    )
)

story.append(P("3. Expérience globale (toutes les pages)", "H1"))
story.append(
    section_table(
        [
            (
                "Loader d’ouverture",
                "Splash plein écran au chargement : marque N, orbites bleu/or, texte « Connecting intelligence. », pourcentage.",
                "Fond noir cinématique, glow électrique, barre bleu → or, fade-out propre.",
                "Décider si le message reste en anglais (marque UK) ou passe en français pour un public FR. Traduire éventuellement « Connecting intelligence. ».",
                "live",
            ),
            (
                "Barre de navigation",
                "Filet électrique 2 px en haut d’écran lors d’un changement de page.",
                "Animation courte, non bloquante.",
                "Rien. Comportement technique uniquement.",
                "live",
            ),
            (
                "Loader de route",
                "Pendant le chargement d’une page (Marketplace, Dashboard, Admin) : même langage visuel, version page.",
                "Centré, sans casser le header.",
                "Idem : langue du microcopy.",
                "live",
            ),
            (
                "Mode sombre / clair",
                "Bouton thème dans le header et dans les espaces client / admin. data-theme light|dark.",
                "Header, cartes, champs, marketplace, dashboards suivent le thème. Splash loader reste noir (volontaire).",
                "Valider le contraste des photos produits en mode clair. Corriger tout résidu de chrome trop sombre sur pages intérieures si encore visible.",
                "live",
            ),
            (
                "Header",
                "Logo wordmark, menus Marketplace / Services / Resources / Company, recherche, compte, panier, thème, CTA.",
                "Barre sticky, mega-menu, mobile overlay. Masqué sur login et dashboards.",
                "Libellés FR si le site devient bilingue. CTA « Shop collection » à valider.",
                "live",
            ),
            (
                "Footer",
                "Colonnes plateforme, workspace, société, ressources, newsletter.",
                "Fond profond, wordmark, mentions légales.",
                "Newsletter : connecter un outil (pas encore d’envoi). Textes juridiques définitifs. Entité légale UK.",
                "preview",
            ),
            (
                "Cookies",
                "Bandeau Essential only / Accept all. Stockage local du choix.",
                "Carte flottante bas-gauche.",
                "Politique cookies UK définitive, nom du responsable de traitement, outils analytics éventuels.",
                "preview",
            ),
        ]
    )
)

story.append(PageBreak())
story.append(P("4. Page d’accueil — section par section", "H1"))
story.append(
    P(
        "L’accueil est une vitrine commerce + technologie. L’utilisateur doit comprendre en quelques secondes : "
        "bijouterie connectée, accès fondateur, et capacités (IA, CRM, automatisation, Academy)."
    )
)
story.append(
    section_table(
        [
            (
                "Bandeau d’annonce",
                "Message de collection + lien Discover now vers le marketplace.",
                "Barre compacte bleu profond, typo 10–12 px.",
                "Campagne réelle (livraison, précommande, date de lancement) à la place du texte générique.",
                "preview",
            ),
            (
                "Shop bar",
                "All products, Categories, Offers, Academy + recherche produits.",
                "Ligne sous le header, search field clair.",
                "Catégories métier additionnelles si le catalogue s’élargit (pas seulement bijoux / fondateur).",
                "live",
            ),
            (
                "Mosaïque héro",
                "Grand panneau « Connected thinking. Made tangible. » + Coffret Fondateur + Wear the connection.",
                "Images produit, dégradé, CTA or et lien texte, coins 24 px, padding resserré.",
                "Accroche FR/EN validée. Photos officielles haute définition. Preuve (matériaux, édition limitée).",
                "live",
            ),
            (
                "Ruban infini",
                "Défilement des univers : jewellery, Knowledge Agent, Workflow Studio, Customer Hub.",
                "Marquee discret sous le héro.",
                "Liste d’univers à figer (noms produits officiels).",
                "live",
            ),
            (
                "Bénéfices",
                "4 puces de confiance (digital-first, information claire, équipe joignable, curation).",
                "Icônes électriques, ligne simple.",
                "Remplacer par des preuves réelles : délais, SAV, certifications, made-in, garantie.",
                "preview",
            ),
            (
                "Rail Catégories",
                "Tuiles visuelles : Founder access, Rings, Bracelets, Marketplace, CRM, Academy, SaaS, Business Tools. Cliquables vers routes.",
                "Miniatures carrées, overlay icône. Placées juste après le héro pour être vues.",
                "Images dédiées par catégorie (éviter qu’une tuile CRM réutilise une photo hors sujet). Décider si CRM/SaaS restent sur l’accueil commerce.",
                "live",
            ),
            (
                "Carrousel écosystème",
                "Cartes Knowledge Agent, AI Agents, Workflow, Customer Hub, CRM, ERP, e-commerce, mobile, web, SaaS, cloud, API, cyber, Academy.",
                "Carrousel type « apple cards », overlay sombre, CTA Explore.",
                "Textes courts validés par le métier. Photos/illustrations propriétaires. Ordre commercial des offres.",
                "preview",
            ),
            (
                "Bandeau CTA",
                "« From possibility to progress. » + Talk to our team.",
                "Animation de gradient bleu, typo XXL, bouton or, large padding.",
                "Phrase d’accroche client + destination du bouton (Calendly, formulaire, WhatsApp, e-mail UK).",
                "live",
            ),
            (
                "Cartes plateforme",
                "4 capacités + 2 cartes wobble (opérations / Academy).",
                "Effet glow au survol, grilles 2 colonnes.",
                "Cas d’usage client (1 phrase par carte). Lien vers pages service définitives.",
                "preview",
            ),
            (
                "Collection produits",
                "Rail des 8 produits (2 fondateur + 6 bijoux).",
                "Cartes shop : image, favori, quick view, compare, prix GBP, Add to cart / Buy now.",
                "Fiches : matériaux, tailles, stocks, délais, photos détail/hover. Retirer « Not yet rated » ou brancher vrais avis.",
                "preview",
            ),
            (
                "Éditorial bijoux",
                "Bloc deux colonnes The jewellery edit + image Bague Aura.",
                "Fond glacier, grand titre, CTA collection.",
                "Copy storytelling (origine, technologie de connexion, rituel d’activation).",
                "preview",
            ),
            (
                "Onglets New / Best / Trending",
                "Aperçu curaté ; sans data live, retombe sur la collection de lancement.",
                "Onglets pills + rail.",
                "Dates de sortie, best-sellers réels, trending basé sur analytics (après lancement).",
                "preview",
            ),
            (
                "Offres / Flash deals",
                "Si aucune promo : bannière « Good things are worth looking out for. »",
                "Bannière sombre, badge UP NEXT.",
                "Règles promo, codes, dates, mentions légales des offres.",
                "todo",
            ),
            (
                "Avis clients",
                "Placeholder : les avis n’apparaissent qu’après achats vérifiés.",
                "Bloc deux colonnes, étoile, ton calme.",
                "Avis réels, note moyenne, politique d’affichage (UK consumer law).",
                "todo",
            ),
        ]
    )
)
story.append(PageBreak())
story.extend(screen_block("home-dark", "Accueil — mode sombre", "Héro mosaïque, shop bar et bandeau d’annonce. C’est la première vue client."))
story.append(PageBreak())
story.extend(screen_block("home-light", "Accueil — mode clair", "Même page en thème light. Vérifier logo, contrastes et lisibilité des CTA."))

story.append(PageBreak())
story.append(P("5. Marketplace et commerce", "H1"))
story.append(
    P(
        "Le marketplace n’affiche plus tout le catalogue d’un coup. L’accueil boutique propose d’abord les collections, "
        "puis un extrait bijoux. Les catégories sont de vraies pages."
    )
)
story.append(
    section_table(
        [
            (
                "Landing marketplace",
                "Onglets Discover / Saved / Bag. Featured Founder. Shop by category. 4 bijoux en avant-goût.",
                "Featured 2 colonnes (texte + visuel). Cartes collection overlay. Sidebar catégories + prix. Aide « Talk to our team » dans la colonne, sans chevauchement.",
                "Titres FR. Brief collection (1 paragraphe). Photo fondateur distincte de l’image « cerveau » Knowledge Agent si ce n’est pas voulu.",
                "live",
            ),
            (
                "Catégorie Founder access",
                "2 produits : Carte Fondateur (£1) et Coffret Fondateur (£189).",
                "Bannière de catégorie + grille filtrée.",
                "Expliquer le £1 (activation ? caution ? symbole ?). Contenu : ce que la carte ouvre réellement, conditions, stock.",
                "preview",
            ),
            (
                "Catégorie Connected jewellery",
                "6 produits (3 bagues, 3 bracelets), prix £129–£229.",
                "Même chrome marketplace, filtre actif, pagination si besoin.",
                "Noms officiels, métaux, tailles, technologie « connected », notices sécurité, photos packshot + porté.",
                "preview",
            ),
            (
                "Fiche produit",
                "Galerie, prix source, Add to cart, Save, specs, FAQ produit, zone avis vide.",
                "Layout 2 colonnes, sticky buy, zoom.",
                "Descriptions longues, livraison UK, retours, conformité, SKU, GTIN, stock.",
                "preview",
            ),
            (
                "Panier / Checkout",
                "Bag preview, quantités, total GBP. Checkout désactivé : « Purchasing opens at launch ».",
                "Étapes 01 Bag / 02 Review / 03 Confirmation.",
                "Stripe/Shopify ou équivalent, TVA UK, livraison, CGV, e-mails transactionnels.",
                "preview",
            ),
            (
                "Wishlist",
                "Sauvegarde locale sur l’appareil.",
                "Même grille cartes.",
                "Compte utilisateur pour synchroniser entre appareils.",
                "preview",
            ),
        ]
    )
)
story.append(PageBreak())
story.extend(screen_block("marketplace", "Marketplace — landing", "Collections d’abord : Founder access et Connected jewellery, puis un extrait bijoux."))
story.append(PageBreak())
story.extend(screen_block("category-jewellery", "Catégorie Connected jewellery", "Filtre catégorie actif, six bijoux, prix en GBP."))
story.append(PageBreak())
story.extend(screen_block("category-founder", "Catégorie Founder access", "Uniquement Carte Fondateur et Coffret Fondateur."))
story.append(PageBreak())
story.extend(screen_block("product", "Fiche produit — Bague Aura", "Galerie, prix, Add to cart, Save. Zone avis encore vide."))
story.append(PageBreak())
story.extend(screen_block("cart", "Panier", "Aperçu du bag. Le checkout n’encaisse rien."))

story.append(PageBreak())
story.append(P("6. Academy", "H1"))
story.append(
    section_table(
        [
            (
                "Catalogue cours",
                "Parcours Practical AI, Automation, etc. Recherche et catégories. Progression stockée dans le navigateur.",
                "Carte path + dashboard d’apprentissage, badges, durées.",
                "Cours officiels, durées réelles, auteurs, langue (EN/FR), certificats délivrés par un vrai backend.",
                "preview",
            ),
            (
                "Leçon / player",
                "Texte de leçon, marquer comme terminé. Player lazy-load.",
                "Lecture calme, sticky actions.",
                "Vidéos, quiz, exercices fichiers, suivi de compte.",
                "todo",
            ),
        ]
    )
)
story.append(PageBreak())
story.extend(screen_block("academy", "Academy — catalogue", "Parcours d’apprentissage. La progression est encore locale au navigateur."))
story.append(PageBreak())
story.extend(screen_block("academy-course", "Academy — leçon Practical AI", "Lecture de leçon. Vidéos, quiz et certificats réels restent à fournir."))

story.append(PageBreak())
story.append(P("7. Pages société, services et ressources", "H1"))
story.append(
    section_table(
        [
            (
                "Services",
                "Vue d’ensemble des capacités + pages dédiées (AI, Agents, Automation, CRM, ERP, SaaS, mobile, web, cloud, cyber, consulting…).",
                "Page-head dégradé, cartes, split copy, process Discover / Design / Deliver.",
                "Offre packagée, livrables, délais types, secteurs, études de cas autorisées.",
                "preview",
            ),
            (
                "Solutions / Industries",
                "Grilles d’enjeux (ops intelligentes, CX, knowledge, produit digital…) et secteurs (retail, santé, finance…).",
                "Info-cards uniformes.",
                "Preuves sectorielles, logos clients (avec autorisation), pages industrie plus profondes.",
                "preview",
            ),
            (
                "Pricing",
                "Discovery / Build / Evolve — pas de grille tarifaire services. Mention : prix marketplace illustratifs.",
                "3 cartes + notice.",
                "Fourchettes ou packs si le commercial le souhaite. Conditions de devis.",
                "todo",
            ),
            (
                "About",
                "Présentation société UK, mission, approche.",
                "Overview company, ton éditorial.",
                "Histoire, équipe, photo bureau UK, valeurs validées, entité légale.",
                "todo",
            ),
            (
                "Contact",
                "Formulaire présent mais service UK « being prepared ». Carte d’accompagnement.",
                "Split formulaire / aside.",
                "Backend e-mail/CRM, adresse, téléphone, horaires, carte, RGPD/UK GDPR.",
                "todo",
            ),
            (
                "Blog / Resources",
                "3 articles de fond (private AI, automation, software that scales).",
                "Cartes + pages article.",
                "Calendrier éditorial, auteurs, visuels, SEO FR/EN.",
                "preview",
            ),
            (
                "FAQ",
                "4 questions (focus UK, systèmes existants, achat, certificats).",
                "Accordéons.",
                "FAQ commerce, livraison, retours, data, délais projet — 12 à 20 questions réelles.",
                "todo",
            ),
            (
                "Portfolio / Case studies",
                "Notice : résultats clients en attente d’approbation. 3 cartes méthodologiques.",
                "Notice + cards.",
                "Études de cas signées, métriques, logos, avant/après.",
                "todo",
            ),
            (
                "Partners / Investors",
                "Partenaires : placeholder. Investors : conversation stratégique, aucune offre.",
                "Split / prose sobre.",
                "Noms partenaires, chartes, deck investisseurs hors site public.",
                "todo",
            ),
            (
                "Support / Documentation",
                "Liens d’aide. Docs expliquent le preview (localStorage). API live à venir.",
                "Prose + cards.",
                "Centre d’aide, SLA, docs produits versionnées.",
                "preview",
            ),
            (
                "Légal (Privacy, Cookies, Terms, Legal)",
                "Textes pré-lancement avec encadré d’avertissement.",
                "Prose + notice.",
                "Documents avocats UK : entité, DPO, sous-traitants, CGV vente, retours 14 jours si e-commerce.",
                "todo",
            ),
        ]
    )
)
story.append(PageBreak())
story.extend(screen_block("services", "Services — vue d’ensemble", "Portefeuille de capacités. Les textes restent génériques tant que l’offre n’est pas packagée."))
story.append(PageBreak())
story.extend(screen_block("ai", "Page service — Artificial Intelligence", "Modèle de page capacité : titre, promesse, process Discover / Design / Deliver."))
story.append(PageBreak())
story.extend(screen_block("solutions", "Solutions", "Grille d’enjeux business. Aucune preuve client pour l’instant."))
story.append(PageBreak())
story.extend(screen_block("industries", "Industries", "Secteurs cibles. Pages plus profondes à écrire."))
story.append(PageBreak())
story.extend(screen_block("pricing", "Pricing", "Trois conversations (Discovery / Build / Evolve), pas de grille tarifaire."))
story.append(PageBreak())
story.extend(screen_block("about", "About", "Présentation société. Équipe, photos et entité légale à livrer."))
story.append(PageBreak())
story.extend(screen_block("contact", "Contact", "Formulaire visible. L’envoi n’est pas encore connecté."))
story.append(PageBreak())
story.extend(screen_block("faq", "FAQ", "Quatre questions d’aperçu. FAQ commerce complète à rédiger."))
story.append(PageBreak())
story.extend(screen_block("blog", "Blog / Insights", "Trois articles de fond. Calendrier éditorial à décider."))
story.append(PageBreak())
story.extend(screen_block("support", "Support", "Portail d’aide. Tickets et SLA réels à brancher."))
story.append(PageBreak())
story.extend(screen_block("documentation", "Documentation", "Explique le mode preview. Documentation produit live plus tard."))
story.append(PageBreak())
story.extend(screen_block("partners", "Partners", "Placeholder. Noms de partenaires après accords et autorisations."))
story.append(PageBreak())
story.extend(screen_block("privacy", "Privacy", "Texte pré-lancement. Passe avocat UK obligatoire."))

story.append(PageBreak())
story.append(P("8. Authentification", "H1"))
story.append(
    section_table(
        [
            (
                "Sign in / Sign up",
                "Écrans dédiés, header/footer masqués. Formulaires de démonstration.",
                "Panneau sombre, formulaire clair, focus accessibilité.",
                "Auth réelle (email, SSO Google/Microsoft, MFA). Messages d’erreur FR/EN. Politique mot de passe.",
                "preview",
            ),
        ]
    )
)
story.append(PageBreak())
story.extend(screen_block("sign-in", "Connexion", "Header et footer masqués. Auth réelle (SSO, MFA) à connecter."))
story.append(PageBreak())
story.extend(screen_block("sign-up", "Création de compte", "Même langage visuel que la connexion."))

story.append(PageBreak())
story.append(P("9. Espace client (Dashboard)", "H1"))
story.append(
    P(
        "Interface /dashboard : shell latéral, recherche, notifications factices, bascule de thème. "
        "Les modules existent en UI avec données de prévisualisation (persona Amira Khan / Northline Commerce)."
    )
)
story.append(
    section_table(
        [
            ("Home", "KPI, activité récente, raccourcis.", "Cartes workspace, densité Linear-like.", "Vraies métriques liées au compte.", "preview"),
            ("Orders", "Commandes physiques, digitales, services.", "Listes / statuts.", "Back-office commandes réel.", "preview"),
            ("Projects", "Espace livraison, jalons, détail projet.", "Board / fiche.", "Jira/Linear ou outil interne branché.", "preview"),
            ("Lead requests", "Devis, consultations, propositions.", "File d’attente.", "CRM réel des demandes.", "preview"),
            ("My CRM", "Société, historique, opportunités côté client.", "Fiche compte.", "Données CRM filtrées au client.", "preview"),
            ("Subscriptions", "Hébergement, retainers, plans IA.", "Cartes d’abonnement.", "Stripe Billing / contrats.", "preview"),
            ("Payments", "Factures et historique.", "Table financière.", "Comptabilité, PDF facture, TVA.", "preview"),
            ("Support", "Tickets, chat, knowledge.", "Inbox.", "Zendesk/Intercom ou outil interne.", "preview"),
            ("Downloads", "Contrats, fichiers, certificats.", "Liste fichiers.", "Stockage sécurisé, e-sign.", "preview"),
            ("Profile", "Sécurité, MFA, clés API.", "Formulaires.", "MFA réelle, rotation des clés.", "preview"),
        ]
    )
)
story.append(PageBreak())
story.extend(screen_block("dashboard", "Espace client — Home", "KPI et activité en données de démonstration. Ne pas présenter comme des chiffres live."))
story.append(PageBreak())
story.extend(screen_block("dashboard-projects", "Espace client — Projects", "Workspace de livraison. Pas encore branché à un outil projet réel."))

story.append(PageBreak())
story.append(P("10. Console admin", "H1"))
story.append(
    P(
        "Interface /admin : même shell, rôle ADMIN CONSOLE. Destinée à l’équipe NEVIE, pas au client final. "
        "Les KPI (revenu 30j, leads, projets) sont des chiffres de démonstration."
    )
)
story.append(
    section_table(
        [
            ("Overview", "Pilotage revenu, demande, opérations.", "KPI + listes.", "Brancher analytics et finance réels.", "preview"),
            ("Analytics", "Marketplace, leads, SEO, trafic.", "Graphiques / tableaux.", "GA4 / plausible / Search Console.", "preview"),
            ("CRM", "Pipeline, sociétés, équipe sales.", "Kanban / fiches.", "HubSpot/Salesforce ou CRM maison.", "preview"),
            ("Automation", "Agents, workflows, tickets.", "Listes d’automations.", "Moteur réel (n8n, interne).", "preview"),
            ("Projects", "Boards, milestones, équipes.", "Gestion de delivery.", "Outil projet unique de vérité.", "preview"),
            ("Finance", "Factures, paiements, refunds.", "Tables.", "Compta + PSP.", "preview"),
            ("CMS", "Pages, blog, SEO, médias.", "Éditeur.", "CMS headless ou admin de contenus.", "preview"),
            ("Marketplace admin", "Catalogue, inventaire, avis.", "Back-office boutique.", "Stocks, prix, moderation avis.", "preview"),
            ("Academy admin", "Cours, étudiants, certificats.", "Listes pédagogiques.", "LMS réel.", "preview"),
            ("Libraries", "Templates IA et automation.", "Galerie.", "Gouvernance des prompts / assets.", "preview"),
            ("Users & roles", "RBAC, permissions, audit.", "Tables utilisateurs.", "SSO, journaux d’audit, rôles juridiques.", "preview"),
            ("Settings", "Marque, APIs, déploiement.", "Formulaires settings.", "Secrets, environnements, domaines.", "preview"),
        ]
    )
)
story.append(PageBreak())
story.extend(screen_block("admin", "Console admin — Overview", "Pilotage interne. Chiffres fictifs, réservés à l’équipe NEVIE."))

story.append(PageBreak())
story.append(P("11. Ce que le client doit décider ou livrer", "H1"))
story.append(P("Priorité haute — bloque un lancement sérieux", "H2"))
story.append(
    bullets(
        [
            "<b>Entité légale UK</b> : nom, adresse, numéro compagnie, TVA, mentions footer.",
            "<b>CGV, confidentialité, cookies</b> : rédaction avocat, pas les textes preview.",
            "<b>Paiement et fulfilment</b> : PSP, stocks, livraison UK/EU, retours.",
            "<b>Auth et comptes</b> : création de compte réelle, e-mails transactionnels.",
            "<b>Contact</b> : destination des leads (e-mail, CRM), temps de réponse annoncé.",
            "<b>Prix</b> : confirmer GBP vs anciens EUR, signification du £1 Carte Fondateur, TTC/HT.",
        ]
    )
)
story.append(P("Priorité contenu — le design est prêt, le fond manque", "H2"))
story.append(
    bullets(
        [
            "Accroches homepage (FR et/ou EN) validées par le brand owner.",
            "Fiches produits complètes + photos packshot, détail, porté, hover.",
            "Ne pas laisser toutes les cartes Founder sur l’image « cerveau » si ce n’est pas le visuel produit.",
            "Page About : équipe, histoire, photo, mission en une page réelle.",
            "3 à 6 études de cas autorisées, ou masquer Portfolio jusqu’à validation.",
            "FAQ commerce et FAQ projets.",
            "Avis : politique d’affichage, ou retirer le bloc jusqu’aux premiers achats.",
            "Offres : calendrier promo ou laisser le empty state « UP NEXT ».",
            "Academy : décider si c’est du vrai e-learning ou une vitrine ; si vitrine, le dire clairement.",
            "Traduction française du site si le PDF client implique un marché FR — aujourd’hui l’UI est en anglais britannique.",
        ]
    )
)
story.append(P("Priorité polish déjà traitée récemment", "H2"))
story.append(
    bullets(
        [
            "Padding et rythme des pages vitrine / marketplace.",
            "Marketplace organisé par catégories, plus un dump de 8 produits.",
            "Liens de catégories fonctionnels.",
            "Thème clair / sombre sur site et dashboards.",
            "Loader d’ouverture et loaders de route.",
            "Header/footer absents sur les pages d’authentification.",
        ]
    )
)

story.append(P("12. Architecture fonctionnelle (vue simple)", "H1"))
arch = Table(
    [
        [Paragraph("Couche", styles["CellHead"]), Paragraph("Aujourd’hui", styles["CellHead"]), Paragraph("Pour le go-live", styles["CellHead"])],
        [P("Front Next.js 15 (App Router, React 19, Tailwind)"), P("Livré — pages, thèmes, dashboards preview"), P("SEO, perf, monitoring")],
        [P("Catalogue"), P("Fichier statique (8 produits, cours, articles)"), P("CMS ou admin catalogue + stocks")],
        [P("Panier / wishlist / progress"), P("localStorage navigateur"), P("Compte + base de données")],
        [P("Paiement"), P("Boutons présents, achat bloqué"), P("PSP + webhooks + factures")],
        [P("Leads / contact / newsletter"), P("UI + message « service en préparation »"), P("CRM + e-mail + consentement")],
        [P("Auth"), P("Écrans"), P("Identity provider + MFA")],
        [P("Dashboards"), P("UI + données persona"), P("API métier, droits, audit")],
    ],
    colWidths=[52 * mm, 64 * mm, 62 * mm],
)
arch.setStyle(
    TableStyle(
        [
            ("BACKGROUND", (0, 0), (-1, 0), CARBON),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, PAPER]),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 7),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("GRID", (0, 0), (-1, -1), 0.3, LINE),
        ]
    )
)
story.append(arch)

story.append(P("13. Recommandation de revue client", "H1"))
story.append(
    P(
        "Proposition d’ordre de relecture (1 session d’environ 45 minutes sur le site, PDF ouvert en parallèle) :"
    )
)
story.append(
    bullets(
        [
            "Accueil en mode clair, puis mode sombre — valider logo, contrastes, accroches.",
            "Marketplace : collections, catégorie bijoux, une fiche produit, panier (constater l’absence de paiement).",
            "Une page service (ex. AI) + Contact (constater le formulaire non branché).",
            "Academy : un cours, une leçon.",
            "Dashboard client puis Admin — rappeler que les chiffres sont fictifs.",
            "Pages légales — planifier la passe avocat.",
            "Liste des livrables contenus (photos, about, cas clients, tarifs, FAQ).",
        ]
    )
)

story.append(Spacer(1, 10))
story.append(P("14. Synthèse", "H1"))
story.append(
    P(
        "Le design de la plateforme UK est largement en place : vitrine premium, marketplace par collections, "
        "thèmes clair/sombre, loader, espaces client et admin. Ce qui manque pour un lancement n’est plus « une page de plus », "
        "c’est le <b>fond réel</b> : contenus propriétaires, preuves, légal, paiements, comptes, et connexion des formulaires. "
        "Tant que ces éléments ne sont pas fournis, le site doit rester présenté comme un <b>aperçu</b>, pas comme une boutique ouverte."
    )
)
story.append(Spacer(1, 14))
end = Table(
    [
        [
            Paragraph("<b>NEVIE-GLOBAL UK</b><br/>Intelligence. Connected.<br/>Document de revue — septembre 2026", styles["Cell"]),
            Paragraph("Palette : Electric Blue #00A9FF · Gold #FFD47A · Carbon #1A1A1A<br/>Logo inchangé. Pas de vert UI. Prix affichés en GBP.", styles["Cell"]),
        ]
    ],
    colWidths=[90 * mm, 88 * mm],
)
end.setStyle(
    TableStyle(
        [
            ("BACKGROUND", (0, 0), (-1, -1), BLACK),
            ("TEXTCOLOR", (0, 0), (-1, -1), WHITE),
            ("LEFTPADDING", (0, 0), (-1, -1), 12),
            ("RIGHTPADDING", (0, 0), (-1, -1), 12),
            ("TOPPADDING", (0, 0), (-1, -1), 12),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]
    )
)
# black table with white text - Cell style is dark ink, need white
styles.add(
    ParagraphStyle("OnBlack", fontName="Body", fontSize=8.5, leading=12, textColor=WHITE)
)
end = Table(
    [
        [
            Paragraph("<b>NEVIE-GLOBAL UK</b><br/>Intelligence. Connected.<br/>Document de revue — septembre 2026", styles["OnBlack"]),
            Paragraph("Palette : Electric Blue #00A9FF · Gold #FFD47A · Carbon #1A1A1A<br/>Logo inchangé. Pas de vert dans l’interface. Prix affichés en GBP.", styles["OnBlack"]),
        ]
    ],
    colWidths=[90 * mm, 88 * mm],
)
end.setStyle(
    TableStyle(
        [
            ("BACKGROUND", (0, 0), (-1, -1), BLACK),
            ("LEFTPADDING", (0, 0), (-1, -1), 12),
            ("RIGHTPADDING", (0, 0), (-1, -1), 12),
            ("TOPPADDING", (0, 0), (-1, -1), 14),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 14),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LINEBEFORE", (1, 0), (1, 0), 1, ELECTRIC),
        ]
    )
)
story.append(end)

doc = SimpleDocTemplate(
    str(OUT),
    pagesize=A4,
    leftMargin=17 * mm,
    rightMargin=17 * mm,
    topMargin=22 * mm,
    bottomMargin=18 * mm,
    title="NEVIE-GLOBAL UK — Dossier client",
    author="NEVIE-GLOBAL UK",
    subject="Revue section par section de la plateforme commerciale",
)
doc.build(story, onFirstPage=cover_page, onLaterPages=header_footer)
print(OUT)
print("pages-built")
