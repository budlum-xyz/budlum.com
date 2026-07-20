//! Tohum verisi — `src/features/explorer/queries/fixtures.ts`'nin Rust portu.
//! SeededRepository bunu çağırır. Gerçek indexer hazır olunca bu modül
//! değiştirilir (veya indexer repo'su bunun yerine konur) — API sabit kalır.

use std::collections::HashMap;

use crate::types::{
    AppCategory, AppIcon, AssetAmount, MarketRow, NftHoldingRow, OwnAccount, TokenHoldingRow,
    TokenMeta, TokenVariant, TransferPreview, TrendingRow, WalletSummary,
};

/// Figma mock adresleri.
pub struct Addresses;
impl Addresses {
    pub const BEYZA: &'static str = "0243a86yu4Fq9tR2vLm8sK1pWdhtA6opA";
    pub const AYAZ: &'static str = "04533a8ru7Kp2mN9cX4vB6qJs1htA64ep";
    pub const USER232393: &'static str = "0699a86u3Tz8wQ5rY2nM7kL4pDhtplopA";
    pub const COUNTERPARTY_A: &'static str = "05redft5g8Hj3kL6mN9pQ2rS5tfeA6ytQ";
}

/// Sadece gösterim — gerçek anahtar değil.
pub const MOCK_PRIVATE_KEY: &str =
    "64898921wyesbguxovyubzuyvzbwyw8997nwh7w92jw8jw2190w12zwbh2199wz7k91zjwzb2wy912yhz1872zeez27h";
pub const MOCK_SEED_PHRASE: &str =
    "course digital budlum heart bee book button melody sponge paw frozen cheese";

fn asset(amount: &str, symbol: &str, variant: TokenVariant) -> AssetAmount {
    AssetAmount {
        amount: amount.into(),
        symbol: symbol.into(),
        variant: Some(variant),
    }
}

fn transfer(
    id: &str,
    amount: &str,
    symbol: &str,
    variant: TokenVariant,
    cp: &str,
) -> TransferPreview {
    TransferPreview {
        id: id.into(),
        amount: amount.into(),
        symbol: symbol.into(),
        variant: Some(variant),
        counterparty: cp.into(),
        counterparty_asset: None,
    }
}

fn app(id: &str, name: &str, cat: AppCategory, icon: AppIcon) -> crate::types::AppUsage {
    crate::types::AppUsage {
        id: id.into(),
        name: name.into(),
        category: cat,
        icon,
    }
}

fn beyza_wallet() -> WalletSummary {
    WalletSummary {
        address: Addresses::BEYZA.into(),
        display_name: Some("Beyza adıgüzel".into()),
        avatar_url: Some("/assets/avatars/avatar-6.png".into()),
        coordinate: Some(crate::types::Coordinate {
            x: 1233.0,
            y: -1234.0,
        }),
        primary_balance: asset("2M", "LUM", TokenVariant::Sage),
        token_count: 26,
        token_total: asset("7.81M", "LUM", TokenVariant::Sage),
        nft_count: 102,
        recent_transfers: vec![
            transfer(
                "t1",
                "100.3K",
                "LUM",
                TokenVariant::Sage,
                Addresses::COUNTERPARTY_A,
            ),
            transfer(
                "t2",
                "90.3K",
                "MUL",
                TokenVariant::Ink,
                Addresses::USER232393,
            ),
            transfer("t3", "107", "LUM", TokenVariant::Sage, Addresses::AYAZ),
            {
                let mut t = transfer(
                    "t4",
                    "107",
                    "LUM",
                    TokenVariant::Sage,
                    Addresses::COUNTERPARTY_A,
                );
                t.counterparty_asset = Some(asset("107", "BUDL", TokenVariant::Tan));
                t
            },
        ],
        recent_apps: vec![
            app("a1", "Lum", AppCategory::Defi, AppIcon::Lum),
            app(
                "a2",
                "Lubo vs Fiction",
                AppCategory::Gamefi,
                AppIcon::Fiction,
            ),
            app("a3", "Bud", AppCategory::Socialfi, AppIcon::Bud),
        ],
    }
}

fn ayaz_wallet() -> WalletSummary {
    WalletSummary {
        address: Addresses::AYAZ.into(),
        display_name: Some("Ayaz adıgüzel".into()),
        avatar_url: Some("/assets/avatars/avatar-2.png".into()),
        coordinate: Some(crate::types::Coordinate {
            x: -420.0,
            y: 866.0,
        }),
        primary_balance: asset("2M", "LUM", TokenVariant::Sage),
        token_count: 26,
        token_total: asset("7.81M", "BUD", TokenVariant::Sage),
        nft_count: 102,
        recent_transfers: vec![
            transfer("t1", "100.3K", "LUM", TokenVariant::Sage, Addresses::BEYZA),
            transfer(
                "t2",
                "90.3K",
                "MUL",
                TokenVariant::Ink,
                Addresses::USER232393,
            ),
        ],
        recent_apps: vec![
            app("a1", "Lum", AppCategory::Defi, AppIcon::Lum),
            app("a2", "Bud", AppCategory::Socialfi, AppIcon::Bud),
        ],
    }
}

fn user_wallet() -> WalletSummary {
    WalletSummary {
        address: Addresses::USER232393.into(),
        display_name: Some("user232393".into()),
        avatar_url: None,
        coordinate: Some(crate::types::Coordinate { x: 87.0, y: 3010.0 }),
        primary_balance: asset("0.00005M", "LUM", TokenVariant::Sage),
        token_count: 2,
        token_total: asset("0.081M", "BUD", TokenVariant::Sage),
        nft_count: 0,
        recent_transfers: vec![transfer(
            "t1",
            "107",
            "LUM",
            TokenVariant::Sage,
            Addresses::BEYZA,
        )],
        recent_apps: vec![app("a1", "Lum", AppCategory::Defi, AppIcon::Lum)],
    }
}

/// Tanımlı cüzdan özetleri (adres → summary).
pub fn wallets() -> HashMap<String, WalletSummary> {
    let mut m = HashMap::new();
    for w in [beyza_wallet(), ayaz_wallet(), user_wallet()] {
        m.insert(w.address.clone(), w);
    }
    m
}

/// Token metadata (lowercase id → meta). Arama sınıflandırması kullanır.
pub fn tokens() -> HashMap<String, TokenMeta> {
    let mut m = HashMap::new();
    m.insert(
        "lum".into(),
        TokenMeta {
            id: "lum".into(),
            symbol: "LUM".into(),
            name: "budlum".into(),
        },
    );
    m.insert(
        "bud".into(),
        TokenMeta {
            id: "bud".into(),
            symbol: "BUD".into(),
            name: "bud".into(),
        },
    );
    m
}

fn own_summary(
    address: &str,
    name: &str,
    avatar: Option<&str>,
    coord: (f64, f64),
) -> WalletSummary {
    WalletSummary {
        address: address.into(),
        display_name: Some(name.into()),
        avatar_url: avatar.map(Into::into),
        coordinate: Some(crate::types::Coordinate {
            x: coord.0,
            y: coord.1,
        }),
        primary_balance: asset("200K", "BUD", TokenVariant::Sage),
        token_count: 2,
        token_total: asset("0.81M", "LUM", TokenVariant::Sage),
        nft_count: 2,
        recent_transfers: vec![transfer(
            "t1",
            "100.3K",
            "BUD",
            TokenVariant::Sage,
            Addresses::BEYZA,
        )],
        recent_apps: vec![
            app("a1", "Lum", AppCategory::Defi, AppIcon::Lum),
            app("a2", "Bud", AppCategory::Socialfi, AppIcon::Bud),
        ],
    }
}

/// Kullanıcının kendi hesapları (Figma "You" portföyü).
#[allow(clippy::type_complexity)]
pub fn own_accounts() -> Vec<OwnAccount> {
    let rows: &[(&str, &str, &str, Option<&str>, (f64, f64))] = &[
        (
            "you",
            "You",
            "0543a86L07Gp4rT8bN2mV6cX1sDptA90pA",
            None,
            (1233.0, -1234.0),
        ),
        (
            "eurymede",
            "Eurymede",
            "0983z65Pm4Kj8nQ2wR6tY1uIojfB17hS",
            Some("/assets/avatars/avatar-4.png"),
            (-210.0, 540.0),
        ),
        (
            "ayaz",
            "Ayaz",
            "0763a86Ly2Wd5sF9gH3jK7lZ4xCptA20ps",
            Some("/assets/avatars/avatar-3.png"),
            (98.0, -77.0),
        ),
        (
            "bugra",
            "Buğra",
            "02s3a86L1t5Vb8nM4kJ9hG2fDsYtA90pA",
            Some("/assets/avatars/avatar-5.png"),
            (4040.0, 12.0),
        ),
        (
            "cheesecake",
            "Cheesecake",
            "0g43GH9kP6mB3vC8xZ5nQ1wEsJh7325Y",
            Some("/assets/avatars/avatar-1.png"),
            (-1500.0, -320.0),
        ),
        (
            "avocado",
            "Avocado",
            "0mv61hi0v9Rt2yU7iO4pL6kJsbe040tR",
            Some("/assets/avatars/avatar-6.png"),
            (730.0, 2205.0),
        ),
    ];
    rows.iter()
        .map(|(id, name, addr, avatar, coord)| OwnAccount {
            id: (*id).into(),
            name: (*name).into(),
            address: (*addr).into(),
            coordinate: crate::types::Coordinate {
                x: coord.0,
                y: coord.1,
            },
            avatar_url: avatar.map(Into::into),
            summary: own_summary(addr, name, *avatar, *coord),
        })
        .collect()
}

/// İşlem satırları — Figma E ekranı deseni (deterministik). Frontend'deki
/// `buildTransactions` ile aynı PRNG tohumu (42).
pub fn build_transactions(count: usize) -> Vec<crate::types::TransactionRow> {
    use crate::types::{TokenVariant, TransactionRow};
    let mut rand = crate::graph::Mulberry32::new(42);
    let base = 1_776_182_692_000_i64; // Date.UTC(2026,3,19,17,51,32) epoch ms
    (0..count)
        .map(|i| {
            let burn = i % 11 == 5;
            let r = rand.draw();
            let sig_int = (r * 1e12) as u64;
            let time = base - (i as i64) * 47_000;
            TransactionRow {
                signature: format!("5xC456Yuh123derJ{}Kp", crate::graph::to_base36(sig_int)),
                time: iso_utc(time),
                instruction: if burn { "burn".into() } else { "swap".into() },
                by: Addresses::BEYZA.into(),
                value: "230000".into(),
                fee: "0.46".into(),
                contract: !burn,
                variant: if i % 6 == 5 {
                    TokenVariant::Purple
                } else {
                    TokenVariant::Sage
                },
            }
        })
        .collect()
}

fn iso_utc(epoch_ms: i64) -> String {
    // Basit ISO 8601 (UTC) — saniye hassasiyetinde frontend formatıyla uyumlu.
    let secs = epoch_ms.div_euclid(1000);
    let millis = epoch_ms.rem_euclid(1000);
    let (y, mo, d, h, mi, s) = epoch_to_ymdhms(secs);
    format!("{y:04}-{mo:02}-{d:02}T{h:02}:{mi:02}:{s:02}.{millis:03}Z")
}

/// epoch saniyesi → (Y,M,D,h,m,s) UTC. (civil_from_days algoritması — tz yok.)
fn epoch_to_ymdhms(secs: i64) -> (i32, u32, u32, u32, u32, u32) {
    let days = secs.div_euclid(86_400);
    let rem = secs.rem_euclid(86_400);
    let h = (rem / 3600) as u32;
    let mi = ((rem % 3600) / 60) as u32;
    let s = (rem % 60) as u32;
    // Howard Hinnant civil_from_days
    let z = days + 719_468;
    let era = if z >= 0 { z } else { z - 146_096 } / 146_097;
    let doe = z - era * 146_097;
    let yoe = (doe - doe / 1460 + doe / 36_524 - doe / 146_096) / 365;
    let y = yoe + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let d = (doy - (153 * mp + 2) / 5 + 1) as u32;
    let m = if mp < 10 { mp + 3 } else { mp - 9 } as u32;
    let year = if m <= 2 { y + 1 } else { y } as i32;
    (year, m, d, h, mi, s)
}

/// Market kategorileri (sabit liste).
pub fn market_categories() -> Vec<String> {
    [
        "All", "DeFi", "DeArt", "DeSci", "SocialFi", "GameFi", "AI", "RWA",
    ]
    .iter()
    .map(|s| (*s).into())
    .collect()
}

pub fn market_rows() -> Vec<MarketRow> {
    let first = MarketRow {
        id: "m1".into(),
        token: "budlum".into(),
        verified: true,
        symbol: "LUM".into(),
        price: "0.003$".into(),
        market_cap: "300,000.23$".into(),
        holders: "230000".into(),
        last_week: "%2.5".into(),
        last_year: "%12.5".into(),
        address: "Hkdsde8hdAq3Rt7Yw2Nb5Km9Jp790Ec".into(),
    };
    let mut rows = vec![first];
    for i in 0..12 {
        rows.push(MarketRow {
            id: format!("m{}", i + 2),
            token: "gurdun".into(),
            verified: false,
            symbol: "GRD".into(),
            price: "0.003$".into(),
            market_cap: "300,000.23$".into(),
            holders: "230000".into(),
            last_week: "%2.5".into(),
            last_year: "%12.5".into(),
            address: "Hkdsde8hdAq3Rt7Yw2Nb5Km9Jp790Ec".into(),
        });
    }
    rows
}

pub fn trending_rows() -> Vec<TrendingRow> {
    (0..10)
        .map(|i| {
            let rank = i + 1;
            let (name, cat, icon) = match i {
                0 => ("Bud", AppCategory::Socialfi, AppIcon::Bud),
                1 => ("Lum", AppCategory::Defi, AppIcon::Lum),
                2 => ("Lubo vs Fiction", AppCategory::Gamefi, AppIcon::Fiction),
                _ => ("Bud", AppCategory::Socialfi, AppIcon::Bud),
            };
            TrendingRow {
                rank: rank as u32,
                name: name.into(),
                category: cat,
                icon,
            }
        })
        .collect()
}

pub fn own_token_holdings() -> Vec<TokenHoldingRow> {
    let mut v = vec![
        TokenHoldingRow {
            id: "h1".into(),
            amount: "200K".into(),
            symbol: "BUD".into(),
            fiat: "20K $".into(),
            variant: TokenVariant::Sage,
        },
        TokenHoldingRow {
            id: "h2".into(),
            amount: "20M".into(),
            symbol: "MUL".into(),
            fiat: "20K $".into(),
            variant: TokenVariant::Purple,
        },
    ];
    for i in 0..6 {
        v.push(TokenHoldingRow {
            id: format!("h{}", i + 3),
            amount: "200K".into(),
            symbol: "LUM".into(),
            fiat: "20K $".into(),
            variant: TokenVariant::Sage,
        });
    }
    v
}

pub fn own_nfts() -> Vec<NftHoldingRow> {
    vec![
        NftHoldingRow {
            id: "n1".into(),
            name: "NFT".into(),
            caption: "Her zaman daima her zam..".into(),
        },
        NftHoldingRow {
            id: "n2".into(),
            name: "NFT2".into(),
            caption: "Her zaman daima her zam..".into(),
        },
    ]
}
