// Dihasilkan oleh scripts/export-fake-news-game.py: judul dari split uji ISOT untuk game 404
// (urutan split, 6-16 kata, judul unik, posisi 3, 4, 5, 6, 7, 1, 2, 14, 10, 13 dipilih pemilik dari kandidat aturan yang sama). Judul tidak diubah selain strip spasi tepi.
// Model hanya diberi judul (seperti pemain). Akurasi model pada judul saja di split uji: 66.14%.
export interface GameTitle {
  label: 'real' | 'fake';
  title: string;
}

export const titleAccuracy = 66.14;
export const fullAccuracy = 98.58;

export const gameTitles: GameTitle[] = [
  {
    "label": "real",
    "title": "U.S. appeals court upholds conviction over shared password"
  },
  {
    "label": "real",
    "title": "Kenya's Supreme Court upholds Kenyatta's presidential win"
  },
  {
    "label": "real",
    "title": "British EU exit a model for Trump's campaign, he says"
  },
  {
    "label": "real",
    "title": "Trump says would be surprised if Iran compliant with nuclear deal: WSJ"
  },
  {
    "label": "real",
    "title": "Trump to receive first security briefing: sources"
  },
  {
    "label": "fake",
    "title": "SENATOR FEINSTEIN Shocks CNN Anchor With “Precise Answer” On Trump/Russia Smear Campaign [Video]"
  },
  {
    "label": "fake",
    "title": "Hillary Clinton Supporters Now Calling for a Recount of Votes in Battleground States"
  },
  {
    "label": "fake",
    "title": "Here’s Proof That Mainstream Media Helped Trump Win"
  },
  {
    "label": "fake",
    "title": "Sean Spicer Finally Admits Obama Probably Didn’t Spy On Trump Through ‘Microwaves’ (VIDEO)"
  },
  {
    "label": "fake",
    "title": "SNL’s ‘Bern Your Enthusiasm’ Explains How Bernie Sanders ACTUALLY Lost Iowa (VIDEO)"
  }
];
