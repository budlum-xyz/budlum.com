//! Cüzdan/token grafik üreticileri — `fixtures.ts` `buildWalletGraph` /
//! `buildTokenDistribution` Rust portu. Deterministik PRNG (mulberry32) +
//! hashCode, frontend JS portuyla birebir (layout her istekte stabil).

use crate::seed::Addresses;
use crate::types::{
    GraphEdge, GraphNode, GraphNodeKind, GraphRelation, GraphVisualVariant, WalletGraph,
};

/// JS `hashCode` portu (Math.imul(31,h) + charCode, i32 wrap, abs).
pub fn hash_code(s: &str) -> u32 {
    let mut h: i32 = 0;
    for c in s.encode_utf16() {
        h = 31i32.wrapping_mul(h).wrapping_add(c as i32);
    }
    h.unsigned_abs()
}

/// JS `mulberry32` portu. State u32, her çağrıda 0x6d2b79f5 eklenir (mod 2^32).
pub struct Mulberry32 {
    a: u32,
}

impl Mulberry32 {
    pub fn new(seed: u32) -> Self {
        Self { a: seed }
    }

    /// [0,1) — JS `((t ^ (t >>> 14)) >>> 0) / 4294967296`.
    pub fn draw(&mut self) -> f64 {
        self.a = self.a.wrapping_add(0x6d2b79f5);
        let mut t: u32 = self.a;
        t = (t ^ (t >> 15)).wrapping_mul(t | 1);
        t ^= t.wrapping_add((t ^ (t >> 7)).wrapping_mul(t | 61));
        (t ^ (t >> 14)) as f64 / 4_294_967_296.0
    }
}

/// JS `Math.floor(n).toString(36)` portu (unsigned, base36).
pub fn to_base36(n: u64) -> String {
    const DIGITS: &[u8] = b"0123456789abcdefghijklmnopqrstuvwxyz";
    if n == 0 {
        return "0".into();
    }
    let mut x = n;
    let mut buf = Vec::new();
    while x > 0 {
        buf.push(DIGITS[(x % 36) as usize]);
        x /= 36;
    }
    buf.reverse();
    String::from_utf8(buf).expect("base36 ascii")
}

const STONE_INDICES: [u32; 13] = [1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14];

fn pick_stone(r: f64) -> u32 {
    let idx = (r * STONE_INDICES.len() as f64) as usize;
    STONE_INDICES[idx.min(STONE_INDICES.len() - 1)]
}

/// Cüzdan ilişki grafiği — TEK HOP outgoing (tasarımcı notu).
pub fn build_wallet_graph(address: &str) -> WalletGraph {
    let mut rand = Mulberry32::new(hash_code(address));
    let satellite_count = if address == Addresses::USER232393 {
        5
    } else {
        10
    };
    let mut nodes = vec![GraphNode {
        id: address.into(),
        kind: GraphNodeKind::Wallet,
        label: None,
        address: Some(address.into()),
        share_pct: None,
        x: 0.0,
        y: 0.0,
        size: 100.0,
        visual_variant: GraphVisualVariant::Star,
        stone_index: None,
    }];
    let mut edges: Vec<GraphEdge> = Vec::new();
    for i in 0..satellite_count {
        let angle = (i as f64 / satellite_count as f64) * std::f64::consts::TAU + rand.draw() * 0.5;
        let r = 150.0 + rand.draw() * 110.0;
        let target: String = if i == 2 && address == Addresses::BEYZA {
            Addresses::AYAZ.into()
        } else {
            let n = (rand.draw() * 1e15) as u64;
            format!("0{}QmR{}pXhtA6o{}A", to_base36(n), i, i)
        };
        let stone = pick_stone(rand.draw());
        nodes.push(GraphNode {
            id: target.clone(),
            kind: GraphNodeKind::Wallet,
            label: None,
            address: Some(target.clone()),
            share_pct: None,
            x: angle.cos() * r,
            y: angle.sin() * r * 0.75,
            size: 52.0 + rand.draw() * 38.0,
            visual_variant: GraphVisualVariant::Stone,
            stone_index: Some(stone),
        });
        edges.push(GraphEdge {
            id: format!("e{i}"),
            source: address.into(),
            target,
            relation: GraphRelation::Transfer,
        });
    }
    WalletGraph { nodes, edges }
}

/// Token arz dağılımı — yoğun holder bulutu (~80 node).
pub fn build_token_distribution(token_id: &str) -> WalletGraph {
    let mut rand = Mulberry32::new(hash_code(token_id).wrapping_add(7));
    let count = 80;
    let mut nodes: Vec<GraphNode> = Vec::with_capacity(count);
    let mut edges: Vec<GraphEdge> = Vec::new();
    for i in 0..count {
        let angle = rand.draw() * std::f64::consts::TAU;
        let r = rand.draw().sqrt() * 330.0;
        let share_pct = if i == 0 {
            5.0
        } else if i < 4 {
            let v = 2.0 + rand.draw() * 1.5;
            (v * 10.0).round() / 10.0 // toFixed(1)
        } else {
            let v = rand.draw() * 0.9;
            (v * 100.0).round() / 100.0 // toFixed(2)
        };
        let address: String = if i == 0 {
            Addresses::BEYZA.into()
        } else if i == 1 {
            Addresses::USER232393.into()
        } else {
            let n = (rand.draw() * 1e15) as u64;
            format!("0{}Hl{}dRhtA6o{}A", to_base36(n), i, i % 10)
        };
        nodes.push(GraphNode {
            id: address.clone(),
            kind: GraphNodeKind::Holder,
            label: None,
            address: Some(address.clone()),
            share_pct: Some(share_pct),
            x: angle.cos() * r,
            y: angle.sin() * r * 0.8,
            size: 22.0 + share_pct.sqrt() * 24.0,
            visual_variant: if i == 5 {
                GraphVisualVariant::Star
            } else {
                GraphVisualVariant::Stone
            },
            stone_index: Some(pick_stone(rand.draw())),
        });
        // Anlamlı komşu edge'leri (Figma siyah node çiftleri).
        if i > 0 && rand.draw() < 0.22 {
            let me = nodes.last().expect("me node");
            let mut best_d = f64::INFINITY;
            let mut best_id: Option<&str> = None;
            for other in nodes.iter().take(nodes.len() - 1) {
                let dx = other.x - me.x;
                let dy = other.y - me.y;
                let d = dx * dx + dy * dy;
                if d < best_d {
                    best_d = d;
                    best_id = Some(&other.id);
                }
            }
            if let (Some(src), true) = (best_id, best_d < 120.0 * 120.0) {
                edges.push(GraphEdge {
                    id: format!("d{i}"),
                    source: src.to_string(),
                    target: address,
                    relation: GraphRelation::Distribution,
                });
            }
        }
    }
    WalletGraph { nodes, edges }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn mulberry32_is_deterministic() {
        let mut a = Mulberry32::new(42);
        let mut b = Mulberry32::new(42);
        for _ in 0..10 {
            assert!((a.draw() - b.draw()).abs() < f64::EPSILON);
        }
    }

    #[test]
    fn wallet_graph_has_center_plus_satellites() {
        let g = build_wallet_graph(Addresses::BEYZA);
        // merkez + 10 satellite
        assert_eq!(g.nodes.len(), 11);
        assert_eq!(g.edges.len(), 10);
        assert_eq!(g.nodes[0].id, Addresses::BEYZA);
        assert!(matches!(
            g.nodes[0].visual_variant,
            GraphVisualVariant::Star
        ));
    }

    #[test]
    fn token_distribution_has_80_holders() {
        let g = build_token_distribution("lum");
        assert_eq!(g.nodes.len(), 80);
        // en büyük pay merkez (5%)
        assert_eq!(g.nodes[0].share_pct, Some(5.0));
    }
}
