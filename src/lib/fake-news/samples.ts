// Dihasilkan oleh scripts/export-fake-news-model.py: dua artikel asli dan dua palsu dari split uji ISOT
// (urutan split, 80-250 kata, real: dua pertama; fake: posisi 41, 191 dipilih pemilik). Judul dan isi tidak diubah selain strip spasi tepi.
export interface FakeNewsSample {
  label: 'real' | 'fake';
  title: string;
  text: string;
}

export const samples: FakeNewsSample[] = [
  {
    "label": "real",
    "title": "Trump says would be surprised if Iran compliant with nuclear deal: WSJ",
    "text": "WASHINGTON (Reuters) - U.S. President Donald Trump said on Tuesday he would be surprised if Iran is in compliance with a nuclear deal when recertification comes up again in three months, according to an interview with the Wall Street Journal. “We’ll talk about the subject in 90 days but I would be surprised if they were in compliance,” he told the Journal. The president must certify to Congress every three months that Iran is complying with the 2015 nuclear deal."
  },
  {
    "label": "real",
    "title": "China's Xi tells Trump maintaining peace in Korean peninsula is China's unswerving goal",
    "text": "SINGAPORE (Reuters) - Chinese President Xi Jinping told his U.S. counterpart Donald Trump that it is Beijing s unswerving goal to maintain peace and stability in Northeast Asia and denuclearize the Korean peninsula, the official Xinhua news agency said on Wednesday. Xi made the comments in a phone conversation with Trump, who urged the Chinese leader to exert pressure on North Korea after Pyongyang said it successfully tested a new intercontinental ballistic missile."
  },
  {
    "label": "fake",
    "title": "FORMER SECRETARY OF DEFENSE GATES RIPS INTO OBAMA For Putting Politics Over Our Troops [Video]",
    "text": "Former CIA Director Robert Gates rips into Obama for his refusal to say the troops are in a combat role in the Middle East. Obama s doing a great disservice to our troops! Ever since American forces have been deployed to fight ISIS, the White House has said that they are not there in a combat capacity, even though three Americans have been killed fighting the terror group."
  },
  {
    "label": "fake",
    "title": "NBC NEWS CHIEF Makes Ugly Confession About Debut Of New Show With Unpopular $17 Million Host Megyn Kelly",
    "text": "NBC News chairman Andy Lack confessed to nervousness about Megyn Kelly s upcoming network morning show, saying the risk is  unnerving  and  a little scary. Lack s confession about Kelly s upcoming debut is not exactly a vote of confidence for their $17 million golden girl Kelly, the former Fox News host, is debuting her daily 9 a.m. ET show  Megyn Kelly Today  on Sept. 25. Her summertime  Sunday Night With Megyn Kelly  newsmagazine program served as a test launch of sorts, but it disappointed, both critically and in the ratings.Lack signed Kelly away from Fox with an offer reportedly worth more than $17 million a year. Her show will follow Savannah Guthrie and Matt Lauer on NBC s treasured  Today  show, which wins its time slot in the vaunted 25-to-54 demographic.   WFB"
  }
];
