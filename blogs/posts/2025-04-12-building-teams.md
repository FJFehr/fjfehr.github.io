---
title: 'Building Teams'
date: 2026-04-12
excerpt: "Part 3 of the PhD survival series. PhDoing: A PhD is designed to be individual, but the work that compounds is often collaborative. The best work comes from the best teams. But how do we build them? It is about culture, good engineering, small teams, clear ownership, scaling structure as you go."
thumbnail: "blogs/images/idiap/justiceLeagueNVIB_compressed.png"
short_title: 'Building Teams'
id: building-teams-2026
# hidden: true
---

**TL;DR** The most meaningful work I did was not done alone. A PhD is designed to be individual, but the work that compounds is often collaborative. Great teams start with culture, then add good engineering, clear ownership, and structure as they scale. Small teams move fast and go deep, while larger teams need hierarchy or coordination becomes the bottleneck. The collaborations that mattered most were driven by curiosity and genuine enjoyment rather than output metrics.

## Collaborations during PhD


<!-- COLAB
TODO
Almost all researchers are trying to write great papers; if you have an idea they could help with, you'd be surprised how often a simple email works: "Hi [person], I am working on [project] and have done [steps 1-3]. I am now working on [problem] and believe [your work] would help. Would you be open to meeting to discuss?" Or, another format, "Hi [person], I saw that in your [paper] you proposed [problem]. I have solved [steps 1-3] and believe that with your help we could address [step 4,5]. Would you be open to meeting to discuss?"

Very actionable. SHow that you have done some work and show you acknowledfe their work. No one wants to work with someone who is going to waste their time or not do any work. But everyone is happy to jump on a collaboration while its near the end. email someone a solution to a problem they appear interested in, you're far more likely to get a reply (or even a paper) than if you just send an email "I love your work can we collaborate". Send only when you have something to ask. Not just lets collab
 -->


A PhD is designed to be individual. You own the problem, you defend the thesis, your name sits first. Collaboration can feel optional, sometimes even like a distraction from the *“real”* work.  I think that’s a darn shame. Done well, collaboration is one of the strongest accelerators in a PhD. You borrow strengths you do not have. You contribute strengths others lack. When ownership is clear and incentives align, progress compounds. But this does not happen automatically. 

I was lucky to do my PhD at [Idiap Research Institute](https://www.idiap.ch/en/), a place small enough to talk to almost anyone over coffee, but broad enough to span NLP, speech, vision, graphs and more. The environment made collaboration easy, but ease alone is not enough. Some projects thrived because the structure was right. Others struggled as they scaled. 

**Overview** I want to show a few examples, from small, tight teams to large, flat collaborations, and what each taught me. The lesson is not that collaboration is always good. It is that its effectiveness changes with scale, structure, and clarity of ownership.

## Torch

[**Torch**](http://torch.ch/torch3/) is one of Idiap’s older collaborations, a project that predates most modern PhDs and later evolved into what we now know as [**PyTorch**](https://github.com/pytorch/pytorch). Ronan Collobert, Samy Bengio, Johnny Mariéthoz and others built an open-source machine learning library that quietly became foundational to AI research and deployment worldwide. The technical impact is obvious.

**Rigour and Joy** What stuck with me more were the team photos. You do not see a polished product team or corporate branding. You see friends building something together. They look relaxed. Slightly chaotic. Happy. They never lost their sense of humour. At the same time, they were producing work of serious technical depth.

That combination is rare and beautiful! Rigour without joy burns people out. Joy without rigour produces little. Torch showed me that collaboration can (should?) hold both. Before structure and division of labour, there is culture. Culture is what makes people want to build together in the first place. It shapes how people share ideas, challenge each other, and whether they enjoy the process enough to keep going. That’s something that I really resonate with and Idiap was the perfect place to foster this. The same pattern shows up beyond research too. The strongest teams often feel like this: slightly messy, highly engaged, and genuinely enjoying building something together.


<figure class="collab-figure" style="max-width: 600px; margin: 20px auto;">
  <img src="images/idiap/torch_meme.png" alt="Torch Team" style="width: 100%; border-radius: 8px; display: block;">
  <figcaption style="text-align: center; font-size: 14px; color: gray;">Torch founders from Idiap [Torch Library](http://torch.ch/torch3/) (top), and Idiapers of 2025 recreating for fun (bottom). Check out the OG [Torch paper (2002)](https://infoscience.epfl.ch/server/api/core/bitstreams/7513f344-91b6-427d-a020-7836b150a150/content)</figcaption>
</figure>

## Linear Transformers

Torch showed what collaboration can build, [Linear Transformers](https://linear-transformers.com/) highlights the important of careful engineering. The project started in a course at EPFL, by a small group of friends. From what I heard, the first submission actually got rejected! The idea was interesting, but the practical impact was not convincing. They could not demonstrate real speedups, and without that, the contribution felt incomplete.

Instead of moving on, they doubled down. Apoorv and Angelos rewrote the linear attention module in custom CUDA kernels to achieve actual GPU speedups! Anyone who has written CUDA knows this is not glamorous work. It is slow, brittle, and painful. This was before AI assistants. Just careful engineering and persistence. It was a serious commitment, and it changed the trajectory of the project.

**Impact follows good engineering** They packaged the project properly. Clean code. Clear documentation. Simple benchmarks. A proper website. You could run it. You could compare it. You could build on it. That part is easy to underestimate in research.

Making code reusable changes everything. If people can try your method without fighting your repository, they will. If they can extend it, your idea gains traction. We are not trained as engineers by default, and that is fine. But a PhD is a rare chance to learn those skills. Even modest engineering discipline can multiply the impact of a good idea.


<figure class="collab-figure" style="max-width: 600px; margin: 20px auto;">
  <img src="images/idiap/lineartransformers-batmanRobin.png" alt="Apoorv and Angelos" style="width: 100%; border-radius: 8px; display: block;">
  <figcaption style="text-align: center; font-size: 14px; color: gray;">I made this depiction of Apoorv and Angelos. I am fairly certain this was how it looked when they were working on Linear Transformers. [Paper](https://proceedings.mlr.press/v119/katharopoulos20a.html), [Website](https://linear-transformers.com/), [Code](https://github.com/idiap/fast-transformers), [Video](https://www.youtube.com/watch?v=hAooAOFRsYc).</figcaption>
</figure>


## Hypermixer

Torch showed culture. Linear Transformers showed engineering. [Hypermixer](https://aclanthology.org/2023.acl-long.871) was the first time I felt both come together. 

We were inspired by [MLP-Mixer](https://proceedings.neurips.cc/paper/2021/hash/cba0a4ee5ccd02fda0fe3f9a3e7b89fe-Abstract.html). A simple and clean idea. Mix across tokens *and* mix within tokens. Only MLPs and transposition. No attention. It worked for fixed-size images and the obvious question was whether the same simplicity could survive in language. Spoiler... Nope. Language has variable sequence lengths. Fixed mixing meant padding everything to a constant size. That does not scale. What looked elegant in vision became awkward in NLP. 

**The breakthrough was not adding complexity, but preserving simplicity** Let hypernetworks generate the right-sized matrices on the fly. And boom! The mixing across tokens is dynamic, similar in spirit to attention. The same function could handle any input length. The model stays fully MLP-based and linear in sequence length rather than quadratic. In that sense, HyperMixer became a natural complement to linear transformers. 

What stayed with me was not just the approach of simplicity, but the team dynamic. A small group, short time-frame, simple idea and fun curious ethos. That process led to my first published paper! My first real collaborative win.

<figure class="collab-figure" style="max-width: 600px; margin: 20px auto;">
  <img src="images/idiap/hypermixer-avengers.png" alt="Hypermixer Team" style="width: 100%; border-radius: 8px; display: block;">
  <figcaption style="text-align: center; font-size: 14px; color: gray;">The Hypermixer team assemble. [Paper (ACL 2023).](https://aclanthology.org/2023.acl-long.871/)</figcaption>
</figure>

"*Make everything as simple as possible, but not simpler.*" - Apparently Einstein.

## Learning to Abstract

Hypermixer taught me that small teams can take a simple idea far. This project was the first time I tried to design that dynamic deliberately.

I initiated it with Melika as a one-month experiment. The question was focused: could we use the explainability properties of NVIB to induce useful abstract representations? We agreed on the scope early and split the work cleanly. I handled modelling, training, and design. She owned the data, evaluations, and interpretation. Clear ownership. Minimal overlap. Very little friction.

The structure made the difference. Because responsibilities were explicit, we did not step on each other’s toes. Decisions were fast. Feedback loops were short. In one month, we had a short paper accepted at EMNLP showing that NVIB can induce useful, sparse abstract representations. We shared first authorship. A small paper, but tightly executed.

What stayed with me was how powerful constraint can be. Two people. One month. Clear roles. Complementary skills. No ambiguity about who does what. **Clear division of labour lets small teams move fast and go deep.**

<figure class="collab-figure" style="max-width: 600px; margin: 20px auto;"> <img src="images/idiap/abstractNVIB-nemo.png" alt="AbstractNVIB Nemo" style="width: 100%; border-radius: 8px; display: block;"> <figcaption style="text-align: center; font-size: 14px; color: gray;"> Two researchers. One mission. Just keep collaborating. Finding NVIB [Paper (EMNLP Findings 2023).](https://aclanthology.org/2023.findings-emnlp.106/)</figcaption> </figure>

## Fine-Tuning with NVIB

Abstraction with NVIB showed me how powerful small, tightly designed teams can be. **This project was my attempt to scale that idea across the research institute**.

Idiap made that possible. Multiple research groups, spanning NLP, speech, and vision. I proposed a institution-wide collaboration around NVIB (my PhD project haha), applying the same core idea across modalities. I was first author and coordinator, connecting the method to each model, while each student owned one experiment. On paper, the division of labour was clear.

**What worked was the collective learning**. People helped each other across domains. Tools were shared. Pipelines were explained. We all learned a lot! I gained exposure to new areas, especially speech, and learned what different communities value. We produced a unified multiple modality paper, accepted as an [ICLR workshop paper](https://openreview.net/forum?id=eX0VFgG4IS). The breadth was real, and so was the collective growth.

**What did not work was the structure.** There were eight PhD students and three supervisors, but no hierarchy or sub-teams. I became the central node for communication and technical integration. Every insight flowed through me, had to be adapted across each pipeline, and passed back out. *Remember no agents for this.* The coordination overhead grew quickly. Clear ownership was not enough at this scale. Depth suffered, and focus diluted. **As teams grow, structure must grow with them. Without hierarchy, communication becomes the bottleneck.**


<figure class="collab-figure" style="max-width: 600px; margin: 20px auto;">
  <img src="images/idiap/justiceLeagueNVIB.png" alt="Justice League" style="width: 100%; border-radius: 8px; display: block;">
  <figcaption style="text-align: center; font-size: 14px; color: gray;">Justice League assembles. [Paper (ICLR Workshop 2025).](https://openreview.net/forum?id=eX0VFgG4IS)</figcaption>
</figure>


## SYNTH*IA* 

**This collaboration felt like a synthesis of everything I had learned.** Torch had shown me that rigour and silliness belong together. Linear Transformers and Hypermixer reinforced that clever engineering works best when the idea stays simple. The NVIB projects taught me that small teams with clear roles move fast and go deep. With SYNTH*IA*, an entrepreneurial hackathon project, it all of that came together. But this time the fuel was different. It was passion, fun, and cool.

**The idea itself was deliberately simple.** Model live music generation as a conversation. Use current current language modeling technology to perform a musical dialogue with MIDI tokens. That framing allowed us to reduce the problem complexity and make it faster. Using keyboard MIDI to keyboard MIDI allowed for low latency and a clean pipeline. No audio or background noise modelling. No unnecessary complexity. To keep latency low and the demo stable, we simplified even further. The demo was not even a true language model or next token predictor but actually just some clever rules syntheized by Laurent! A tight loop we could actually play live. Simplicity made it buildable and playable.

**What made it work was the team.** Three friends aligned by passion, with complementary strengths and high trust. Laurent brought technical pragmatism and serious musicianship. He grounded ambitious ideas and turned them into our working prototype. Karl has unmistakable “Steve Jobs” energy, obsessed with product feel, design, and the nostalgic retro-electro-synth aesthetic. His room was a studio in both senses of the word. I took the role of glue and storyteller, shaping the pitch, keeping us aligned, and maintaining momentum. I brought homemade lasagne, lava lamps, and ridiculous speedy sunglasses to keep the vibes high. There was no ego. We trusted each other. We took breaks and played music together. It felt less like a startup and more like a band.

<figure class="collab-figure" style="max-width: 500px; margin: 20px auto;">
  <img src="images/idiap/AlbumCover.png" alt="SYNTHIA band album cover" style="width: 100%; border-radius: 8px; display: block;">
  <figcaption style="text-align: center; font-size: 14px; color: gray;">SYNTH*IA* Album Cover: The first AI band member that JAMS with you. On Demand. Interactive. Creative.</figcaption>
</figure>

**ICC ‘appiness.** This happened inside the entrepreneurial Idiap Create Challenge (ICC), a ten-day sprint to build an AI startup from scratch. Build the product. Test it. Pitch it. Demo it. The pressure was electric! Retro synths. Gameboy nostalgia. The songs *Jump* and *Hey Jude* reborn through AI and MIDI generation. We approached it with a “*yes, and*” improv attitude. I met with a mentor and asked how to sell this idea? “*It’s easyyy,*” he said in a French accent, “*you are sel-ling ‘appiness!*” Then I asked why it should be in Valais, Switzerland? “*It’s obvious,*” he said while my face was blank, not finding it obvious at all. “Valais is the ‘eart of cul-ture, and music is cul-ture.” I remember standing there, slightly stunned, thinking he might actually be right. During the final demo, the room felt it. Our demo was a music concert! 

<div class="media-item" style="max-width: 600px; margin: 20px auto;">
  <div class="media-thumbnail">
    <iframe
      src="https://www.youtube.com/embed/Vhwi-pR9_wg"
      title="SYNTHIA Demo: Idiap Create Challenge"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen>
    </iframe>
  </div>
  <div class="media-info">
    SYNTH<em>IA</em>
    <p>Demo: Idiap Create Challenge</p>
  </div>
</div>

**We did not optimise for winning. We optimised for joy.** And as a result we won first place! The cash prize of 15,000 CHF was secondary (and appreciated). What I am most proud of is how it felt. *It gave me shivers while writing this.* Friends doing something we genuinely loved, under pressure, without losing the fun. Silly and simple, yet effective. Viktor Frankl wrote that success, like happiness, cannot be pursued, it must ensue. This collaboration made that concrete for me. When the work is energising and meaningful, success tends to follow quietly (but with funky retro synths) behind.

<figure class="collab-figure" style="max-width: 500px; margin: 20px auto;">
  <img src="images/idiap/synthia_winning.jpeg" alt="SYNTH*IA* team winning the Idiap Create Challenge" style="width: 100%; border-radius: 8px; display: block;">
  <figcaption style="text-align: center; font-size: 14px; color: gray;">Idiap Create Challenge 2025 winners.</figcaption>
</figure>


## Takeaways

A PhD is designed to be individual, but the most meaningful parts of mine were collaborative. Collaboration does not work by accident; it requires clear ownership, shared incentives, and deliberate design. Small teams thrive on trust, complementary strengths, and a genuine “yes, and” energy. As teams grow, structure must grow with them, or communication quickly becomes the bottleneck. And in the end, the collaborations that mattered most were the ones driven by passion and curiosity rather than output metrics.

**What collaboration taught me:**

- Culture comes first. Work with people you trust, admire and enjoy building with.  
- Engineer for usability if you want ideas to spread.  
- Keep teams small for depth, speed, and simplicity.  
- Design ownership early and make roles explicit.  
- As teams grow, add structure and hierarchy, or communication becomes the bottleneck.  
- Optimise for meaning; success tends to follow.  