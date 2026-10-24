export interface SampleDocument {
  id: string;
  title: string;
  fileName: string;
  category: string;
  summary: string;
  content: string;
}

export const SAMPLE_DOCUMENTS: SampleDocument[] = [
  {
    id: 'bio-mitochondria',
    title: 'Cellular Respiration and Mitochondria',
    fileName: 'cellular_respiration_guide.pdf',
    category: 'Biology',
    summary: 'An overview of cellular respiration stages, ATP synthesis, and mitochondrial inner membranes.',
    content: `Cellular Respiration and Mitochondrial Energetics

Mitochondria are often referred to as the powerhouses of eukaryotic cells because they generate the vast majority of chemical energy required for cellular processes. This energy is synthesized in the form of adenosine triphosphate (ATP) molecules through a series of biochemical oxidation reactions.

Stages of Cellular Respiration:
1. Glycolysis: Occurs in the cytoplasm outside the mitochondria. One glucose molecule is broken down into two molecules of pyruvate, yielding a net gain of 2 ATP and 2 NADH without requiring oxygen.
2. The Citric Acid Cycle (Krebs Cycle): Occurs in the mitochondrial matrix. Pyruvate is converted to acetyl-CoA, which enters the Krebs cycle, generating electron carriers NADH and FADH2 along with carbon dioxide as a metabolic byproduct.
3. Oxidative Phosphorylation: Takes place across the inner mitochondrial membrane (cristae). High-energy electrons from NADH and FADH2 pass through the electron transport chain (ETC), pumping protons across the membrane into the intermembrane space. This creates an electrochemical proton gradient.
4. ATP Synthase Mechanism: Protons flow back down their gradient into the matrix through the enzyme complex known as ATP synthase. This rotary motor enzyme catalyzes the phosphorylation of ADP into ATP, generating approximately 30 to 32 ATP molecules per oxidized glucose molecule.

Mitochondrial Structure:
The mitochondrion possesses a double membrane architecture. The outer membrane contains protein channels called porins, rendering it permeable to small molecules. In contrast, the inner membrane is highly impermeable, folded into extensive cristae to dramatically increase surface area for electron transport complexes. Inside lies the mitochondrial matrix, containing mitochondrial DNA (mtDNA) and ribosomes capable of synthesizing several essential mitochondrial proteins independently.`,
  },
  {
    id: 'ai-transformers',
    title: 'Transformer Architecture and Self-Attention',
    fileName: 'transformer_attention_mechanisms.pdf',
    category: 'Computer Science',
    summary: 'The foundations of modern AI: self-attention, positional encoding, and feed-forward layers.',
    content: `Foundations of the Transformer Neural Network Architecture

The Transformer model, first introduced by Vaswani et al. in 2017 in the seminal paper 'Attention Is All You Need', revolutionized natural language processing by replacing recurrent neural networks (RNNs) and convolutional networks with an attention-only mechanism.

Core Principles of Self-Attention:
Traditional recurrent models processed sequential data step-by-step, creating sequential bottlenecks that prevented parallel computing during training. The Transformer eliminates recurrence by utilizing self-attention, allowing every token in an input sequence to attend directly to every other token simultaneously.

Key Components:
1. Scaled Dot-Product Attention: The attention function computes the dot product of Query (Q) and Key (K) vectors, divides by the square root of the key dimension (dk) to prevent extreme gradient saturation, and applies a softmax operation to produce attention weights over Value (V) vectors.
2. Multi-Head Attention: Instead of performing a single attention function, multi-head attention projects Queries, Keys, and Values multiple times with different learned linear projections into distinct subspaces. This allows the model to jointly attend to information at different positions and representation subspaces.
3. Positional Encoding: Since Transformers contain no recurrence or convolution, they are permutation invariant by default. To preserve word order, sinusoidal or learned positional encodings are injected into the input embeddings prior to the first layer.
4. Feed-Forward Networks and Layer Normalization: Each encoder and decoder layer contains a fully connected feed-forward network applied identically and independently to each position, paired with residual connections and layer normalization (Pre-LN or Post-LN) to stabilize deep training dynamics.`,
  },
  {
    id: 'space-apollo',
    title: 'The Apollo Lunar Landing Missions',
    fileName: 'apollo_program_history.pdf',
    category: 'History & Science',
    summary: 'The technology, Saturn V rocket stages, and lunar descent module of the Apollo program.',
    content: `The Apollo Lunar Exploration Missions (1961 - 1972)

The Apollo program was an unprecedented human engineering endeavor conducted by NASA between 1961 and 1972, culminating in the first human landing on the Moon on July 20, 1969, during the Apollo 11 mission.

The Saturn V Launch Vehicle:
Conceived under the technical leadership of Wernher von Braun, the three-stage Saturn V rocket stood 363 feet (111 meters) tall. The first stage (S-IC) used five Rocketdyne F-1 engines burning RP-1 kerosene and liquid oxygen (LOX), generating over 7.5 million pounds of sea-level thrust. The second stage (S-II) utilized five J-2 engines burning liquid hydrogen and LOX, and the third stage (S-IVB) fired a single J-2 engine to achieve Earth orbit and later perform the Trans-Lunar Injection (TLI) burn.

Lunar Orbit Rendezvous (LOR) Strategy:
NASA chose Lunar Orbit Rendezvous (LOR), championed by engineer John Houbolt, over Direct Ascent and Earth Orbit Rendezvous. Under LOR, the spacecraft comprised three distinct modules:
1. Command Module (CM): The conical crew habitat that was the only component equipped with a thermal heat shield to survive re-entry into Earth's atmosphere.
2. Service Module (SM): Contained the primary propulsion engine (Aerojet SPS), fuel cells for electrical power, and oxygen tanks.
3. Lunar Module (LM): A two-stage vehicle consisting of a Descent Stage with four landing pads and throttleable descent engine, and an Ascent Stage with a pressurized cabin and ascent engine used to lift astronauts back from the lunar surface to rendezvous with the Command Module in lunar orbit.`,
  },
];
