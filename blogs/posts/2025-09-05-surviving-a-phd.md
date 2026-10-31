---
title: 'A PhD survival guide 2025: EPFL, Idiap, and Martigny 🇨🇭'
date: 2025-09-05
excerpt: "A personal survival guide for a PhD in Machine Learning at EPFL, Idiap, and Martigny"
thumbnail: "blogs/images/idiap/Fabio-Jamie.jpeg"
short_title: 'A PhD Survival Guide'
id: a-phd-survival-guide-2025-epfl-idiap-and-martigny-2025
hidden: true
---

**TL;DR** A personal survival guide for a PhD in Machine Learning. I'll share what worked for me at [EPFL](https://www.epfl.ch/about/) and [Idiap Research Institute](https://www.idiap.ch/en/) in Martigny Switzerland between the years of 2021-2025.


### Who is this for?

This is no manifesto. It’s more of a reflection. You do not need to read it all, maybe just skim what is useful for you and ignore the rest.

This blog is for the prospective or current PhD students who want a practical perspective from someone in the trenches. Maybe it’s also for a younger version of myself who would have valued honest advice before starting. At its core, this is a personal account of what worked, what did not, and what I would consider more carefully if I had to choose again. If you are somewhere along that path, parts of this may resonate.

Sorry it’s long, it started small but as I got going I realised there was loads to say. Oops haha.

{{TOC}}

### Credits and other resources 

Writing this I watched, read and synthesized the following blogs, videos and discussion with other researchers. I recommend checking out these resources too.

<style>
  .phd-card {
    display: flex;
    flex-direction: column;
    border: 2px solid var(--border-color, #e0e0e0);
    border-radius: 6px;
    overflow: hidden;
    width: 240px;
    height: auto;
    text-align: center;
    transition: all 0.2s ease;
    background-color: var(--bg-color, #fff);
    cursor: pointer;
  }
  
  .phd-card:hover {
    background-color: var(--hover-bg, #ffe4cc);
    transform: translateY(-2px);
  }
  
  .phd-card-img-container {
    width: 100%;
    aspect-ratio: 16 / 9;
    flex-shrink: 0;
    background-color: #ddd;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }
  .phd-card-img-container::after {
    content: '▶';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 18px;
    color: rgba(255, 255, 255, 0.95);
    background: rgba(80, 80, 80, 0.55);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    text-align: center;
    line-height: 40px;
    pointer-events: none;
  }
 
  .phd-card-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center;
    display: block;
    border-radius: 8px;
  }
  
  .phd-card-title {
    margin: 0;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-color, #0a0a0a);
    padding: 6px 6px 2px 6px;
    line-height: 1.3;
    flex-shrink: 0;
    text-align: center;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
  
  .phd-card-desc {
    margin: 0;
    font-size: 11px;
    color: var(--muted-color, #666);
    padding: 2px 6px 6px 6px;
    flex-shrink: 0;
    text-align: center;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
 
  .paper-figure {
    transition: all 0.2s ease;
    border: 2px solid transparent;
  }
 
  .paper-figure:hover {
    background-color: var(--hover-bg, #ffe4cc);
    border-color: var(--border-color, #e0e0e0);
    transform: translateY(-2px);
  }
 
  @media (max-width: 600px) {
    .phd-card {
      width: 100%;
      height: auto;
    }
  }
</style>

<style>
  figure img { border-radius: 8px; }
</style>

<div class="phd-card-group">
  <!-- Karpathy Blog -->
  <a href="https://karpathy.github.io/2016/09/07/phd/" target="_blank" style="text-decoration: none; flex-shrink: 0;">
    <div class="phd-card">
      <div class="phd-card-img-container">
        <img class="phd-card-img" src="https://karpathy.github.io/assets/phd/phds.jpg" alt="Andrej Karpathy (2016)">
      </div>
      <h4 class="phd-card-title">Andrej Karpathy (2016)</h4>
      <p class="phd-card-desc">A Survival Guide to a PhD</p>
    </div>
  </a>

  <!-- Yannic Kilcher Video -->
  <a href="https://www.youtube.com/watch?v=rHQPBqMULXo" target="_blank" style="text-decoration: none; flex-shrink: 0;">
    <div class="phd-card">
      <div class="phd-card-img-container">
        <img class="phd-card-img" src="https://img.youtube.com/vi/rHQPBqMULXo/hqdefault.jpg" alt="Yannic Kilcher (2021)">
      </div>
      <h4 class="phd-card-title">Yannic Kilcher (2021)</h4>
      <p class="phd-card-desc">ML PhD Survival Guide</p>
    </div>
  </a>

  <!-- Letitia Video -->
  <a href="https://www.youtube.com/watch?v=prGZTX-Sgqw" target="_blank" style="text-decoration: none; flex-shrink: 0;">
    <div class="phd-card">
      <div class="phd-card-img-container">
        <img class="phd-card-img" src="https://img.youtube.com/vi/prGZTX-Sgqw/hqdefault.jpg" alt="Letitia Parcalabescu (2024)">
      </div>
      <h4 class="phd-card-title">Letitia Parcalabescu (2024)</h4>
      <p class="phd-card-desc">My PhD Journey in AI / ML </p>
    </div>
  </a>
</div>

## Four decisions that shape your PhD:

Here are some thoughts that I believe are essential to consider. **Why**, with **Whom**, **Where**, and in **What** should I do a PhD (in that order). I know, I know, it's  strange to put the topic last but let me explain.

<div style="display: flex; justify-content: center; margin: 4px 0;"> <figure style="margin: 0; text-align: center; max-width: 480px;"> <img src="images/idiap/goldencircle_phd.jpeg" alt="Concentric circles" style="width: 100%; border-radius: 8px; display: block;"> <figcaption style="font-size: 13px; color: gray; margin-top: 6px;">The Golden Circle of PhD Decision Making: Start with *Why?* and work your way out. Side quest: 4 concentric circle with text is massively hard to generate with current models - paper was easier haha </figcaption> </figure> </div>

### 1. Why should you do a PhD?

**A PhD is not a shortcut to success.** Aiming directly for success usually backfires. As Viktor Frankl wrote, success and happiness are side effects. They emerge when you dedicate yourself to something meaningful. This idea echoes [Why Greatness Cannot Be Planned](https://youtu.be/lhYGXYeMq_E?si=yDhof255NzmJ2uh4&t=386), [Simon Sinek’s Golden Circle](https://youtu.be/fMOlfsR7SMQ?si=B4ddiicEDsckWx5X), and [Ikigai](https://en.wikipedia.org/wiki/Ikigai). Ideally, you shouldn’t chase outcomes. You start with **why**. When the problem matters to you, progress and success follow. Research works the same way: focus on the idea, and the papers and PhD tend to come.

**Knowing your why is essential.** Passion isn’t a nice-to-have. It’s fuel. A PhD is full of confusion, failure, impostor syndrome and late nights.  Without a clear reason, it’s very hard to keep going. That “why” becomes your anchor. For me, there were several. I wanted to learn deeply and contribute to knowledge. I wanted to build specialised technical skills that would let me work on impactful problems. But also stay financially independent, and keep my options open internationally. Switzerland also mattered. It let me reconnect with my family roots and experience a culture beyond South Africa. A PhD in machine learning in Switzerland happened to sit at the intersection of all of that.

**A PhD is a long exercise in focus.** Roughly four years. Around 10,000 hours. If that really is enough time to become an expert, the real question is whether you’re excited about what you're experting yourself in. Methods, models, datasets and even required skills will change. The underlying problems you care about probably won’t. The best advice I got from my MSc supervisor was simple: "*Work on something that you like because ultimately it’s your project*". That responsibility does not disappear in a PhD. If anything, it becomes heavier. Something my PhD supervisor said in our first meeting reinforced that idea. He was genuinely excited and said, "*I can't guarentee it will be easy, but it will be so cool!*". That level of enthusiasm mattered to me. It made the challenge feel worth it. That’s the kind of "why" I needed. Not one borrowed from metrics or prestige, but one that still holds when things get hard.

<figure class="collab-figure" style="max-width: 600px; margin: 20px auto;">
  <img src="images/idiap/HendersonInterview.png" alt="Henderson interview COVID 2020" style="width: 100%; border-radius: 8px; display: block;">
  <figcaption style="text-align: center; font-size: 14px; color: gray;">Real footage of my first meeting with Jamie Henderson, during COVID over Zoom in 2020.</figcaption>
</figure>

### 2. With whom should you do a PhD?

**Who you do your PhD with may matter more than the topic.** I see a supervision relationship as similar to a romantic one. Imagine being stuck in that relationship for four years... Yea.. not great. In any relationship, you need someone who has your back, trusts you, is willing to grow with you, and who you can talk to when times get hard. The same applies to a supervisor. If you trust them and their vision, the topic tends to follow naturally. I am grateful to [Jamie](https://scholar.google.com/citations?user=CSib0ooAAAAJ&hl=en) for being that person for me.

**Supervisor seniority comes at the cost of attention.** More famous professors with larger groups provide less day-to-day guidance. Sometimes postdocs or senior group members are more available. If you are a maverick and enjoy figuring things out alone, a big lab with a well-known name can work. The reputation opens doors, but you have to steer your research and build collaborations yourself. If you are newer to research and still building confidence, a younger career supervisor willing to go through the trenches with you can make all the difference. Choosing the right supervision style matters as much as choosing the right person.

**Routine matters** My supervisors’ group had a regular routine. I valued weekly one-to-one meetings even when there was little to discuss. They reduced procrastination, forced clarity, and offered a reality check for half-formed ideas. Weekly group meetings, where we presented papers and shared ideas, reminded me I was not alone. Those small structures for sure improved my PhD experience.


### 3. Where should you do a PhD? 

I’ll take a strong stance on this one. Switzerland 🇨🇭 is one of the best places to do a PhD.

<div style="display: flex; justify-content: center; margin: 4px 0;"> <figure style="margin: 0; text-align: center; max-width: 480px;"> <img src="images/idiap/swiss_cow.png" alt="Swiss cow with headphones doing AI research in the Alps" style="width: 100%; border-radius: 8px; display: block;"> <figcaption style="font-size: 13px; color: gray; margin-top: 6px;">The Swiss PhD in a nutshell: world-class AI research, mountain views, solid funding and compute, and a collaborative international community. </figcaption> </figure> </div>

**Quality**, Swiss universities consistently rank near the top (I was at EPFL), especially in technical fields. For me, it was also personal. I’m a Swiss national, with family there, so it felt natural. But even without that connection, I’d still strongly recommend Switzerland as a place to do a PhD. Why Idiap. Small but big enough. Experts in AI for 30 years (built off the back of artichoke liquor money and famous for work in speech processing). The institute had labs in robotics, biometrics, speech, vision, NLP, AI with a variety of applications such as computational creativity, genomics, emotion modelling, graphs, and privacy.

**Financially**, the balance is hard to beat. PhD salaries are among the highest in the world, and the cost of living is manageable if you’re sensible. In my case, rent was about a quarter of my income after tax. I could pay rent, eat well, and not constantly worry about money. That matters more than people like to admit. If you can’t afford to do a PhD, it becomes much harder to focus on the work. For machine learning computational PhD  considering if the lab has enough resources for compute, experiments etc is also an important consideration. 

**Lifestyle** When research gets tough, you need ways to reset. Switzerland made that easy. Mountains, nature, skiing on winter weekends, and an international community of people going through similar troubles as you. That helped more than I expected. Also being in the center of Europe with a strong currency made it easier explore other countries easily on holidays.

**Its not all roses** I lived in a small town Martigny, which can feel very quiet if you’re used to big cities. For my PhD, that focus was a benefit, but it’s not for everyone. It’s also intimidatingly French-speaking. If you don’t speak French (like I didn't) it became a necessary side project to learn and embrace myself in it. Swiss culture can also be hard to crack (Even for me who is Swiss on paper), especially as a foreigner. I ended up spending most of my time with the international crowd at Idiap, and those bonds became the closest I made. 

If you’re choosing where to do a PhD, don’t underestimate the environment. You’ll live there for years. It will shape how well you work, and how well you live.

### 4. In what topic should you do a PhD?

<In what topic should you do a PhD?

**What topic should you work on?** Start with a simple question: *does the topic genuinely matter to you?* I applied broadly (jobs, tech, studies) and ended up choosing between a PhD in microbiome forensics at UniL and one in core machine learning at EPFL and Idiap. Turning down UniL was tough. It was interesting and I would likely have been the most technical person in the team. But I asked myself a harder question. At the end of four years, do I want to be the expert in this very specific application, or do I want to work on more general problems? I realised I would rather be the dumbest in the room and stretch upwards than be the local expert too early. The topic you choose will shape how you think, so it must connect to a deeper curiosity, not just a short-term opportunity.

<div style="display: flex; justify-content: center; margin: 4px 0;"> <figure style="margin: 0; text-align: center; max-width: 480px;"> <img src="images/idiap/Survivorship-bias.png" alt="WWII plane bullet-hole survivorship bias diagram" style="width: 100%; border-radius: 8px; display: block;"> <figcaption style="font-size: 13px; color: gray; margin-top: 6px;">[The survivorship bias](https://en.wikipedia.org/wiki/Survivorship_bias): The planes that didn't make it back had holes in different places. Research works the same way. Often the important questions are where no one is publishing yet, or where the field has overlooked simpler approaches.</figcaption> </figure> </div>

**Where is no one looking?** Research is rarely evenly distributed. The questions that get attention are the ones that “made it back”, a bit like planes returning from battle. Some areas are neglected for reasons that may be arbitrary, technical, or simply unfashionable. These gaps are often fertile. Start small, test ideas quickly to fail fast to see potential. Look at patterns in *test-of-time awards* at conferences: what stuck around, and why? Often the ideas that endure were not flashy, but solved something fundamental and scalable. This is why, as *Why Greatness Cannot Be Planned* argues, you cannot reliably predict which research will have lasting impact. Focus on curiosity, experimentation, and neglected niches.

<div style="display: flex; justify-content: center; margin: 4px 0;"> <figure style="margin: 0; text-align: center; max-width: 480px;"> <img src="images/idiap/bitter_lesson_meme.png" alt="Rich Sutton's Bitter Lesson meme about computation winning in the long run" style="width: 100%; border-radius: 8px; display: block;"> <figcaption style="font-size: 13px; color: gray; margin-top: 6px;">Rich Sutton's [Bitter Lesson](http://www.incompleteideas.net/IncIdeas/BitterLesson.html): Scale computation beats model-building and inductive bias. The computational steamroller is coming, don't fight against it.</figcaption> </figure> </div>

**Can this topic be done at this lab?** Be pragmatic about whether you can actually research the topic well. Some areas in machine learning demand enormous compute and specific data. If you cannot realistically train models or run competitive experiments, you will constantly feel behind. Resources matter. So do communities. Are there conferences and journals that publish consistently in this space? Are there people around you with experience who can guide you? A topic may be exciting in theory, but if you cannot test ideas properly, it will become frustrating. Feasibility is not glamorous, but it is foundational. Think strategically: the neglected areas you are curious about may be fertile, but you need a base that allows you to explore them without fighting physics or infrastructure. Simple, usable tools and early experiments often become the engine of bigger discoveries.

**Where to next?** Finally, think about where this leaves you after four years. The world will change. In 2021 it was embeddings, 2023 was diffusion, and shortly after large language models, now in 2025–2026 it is agents. The fast fashion of AI moves quickly. If you chase the hottest topic, you risk being outpaced by large labs with deeper pockets. If you choose something too narrow, you risk being boxed in. The balance is to stay general in the problems you care about, but niche and technical enough to build depth without being crushed by competition. You are making a four-year bet on yourself. Choose a problem that will still make sense when the trend cycle moves on.




<!--
I applied to everything under the sun. Jobs, internships, masters programs, PhD programs. over 50 applications and maybe only 20 responses, of which 17 were reject (rest were ghosts) an then 3 I got to final rounds of a startup in machine learning (then rejected), A phD offer in microbiome forensics at UniL and then PhD offer at EPFL and Idiap. I can tell you that turning down the offer of Unil was super tough. I thought about it. At the end of 4 years do I want to be the specialist in dead guy stomach data? I was going to be the most technical in the team. I wanted to be the dumbest in the room not the smartest. Then I have the most to learn!   
This changes fast in ML so the topic is likely to morph as you go but the bigger why and bigger problems you are trying to solve. What are the big problems? Video understanding? Representing learning how do we represent data correctly? How do we solve impactful problems in spaces: Climate, Legal problems, Medical, Education, think bigger. What types of things do need? Faster systems? systems on different hardware? This one derives back to the why in the first point. Do you think this idea has longevity? At the end do you want to be an expert in this? 
- Topic. Choose something where people around you or above you have XP at. They can help. You Should be interested. You should have some expertise. A bit like Ikigai.
    - Unique and cool to you.  (love)
    - Supervisor is good at / passionate about.
    - Good at it. (also ikigai)
    - Money ?
    - World needs it?
- Resources… Can you do pretraining? Ie you do noy have massive GPU clusters? Can you feasibly do research that you are not competing directly with Google, OpenAI and Meta Apple Amazon etc the FANGs (This is why internships are cool later…)
- Choose the biggest hottest topic right now! (For me that would have been 2021 finetuning or training embedding models like BERT, then in 2022 or 2023 WOuld be diffusion models, 2023-2024 would be precursor LLMs like GPT2, Now (end of 2025) would be LLMs and Agents). I would not recommend it. Imagine you started working on MCMC style models or RNN/LSTMs or embedding models. You would really struggle to publish as the fashion trend changes or when the big tech out muscle you. What is niche but important? What could have value always? What could get more important through time?
    - Niche - less competition - become the best at it. Bandits, optimisation, biologically plausible NN, SOmething with a theoretic backbone that isnt super easy to dive into. Legal NLP, ML applications such as Legal, Medical, Education, Psycology and emotions, Security, generalisation, trustworthyness (safety), explainable, mechanistic interpretability, reasoning etc. As technology advances do these topics become more or less important through time?
    - I worked on my own niche. This was really hard. Because there was very little to benchmark against. A VAE for transformers. At the time there wasnt anything like it. Required complex math and very MNIST style base plates to make sure it works.
    - What communities publish consistently every year?
    - Take your time and make sure you care. It will be your topic for approx 4 years.
    - Chat to people (or read blogs like these) they have gone through it and can speak from XP buit as bob dylan wrote “Ohhh tiems they are a changining”
    - Projects - how many papers, or journals. What are the expectations of the phd This is something you should .
    - What do you want to do after?
    - A phd I a long term exercise on focus. Can you do youtr thing for 4 years. It will be tough it wont work (nearly always) and you got to keep going.
    - 
-->





## Collaborations during PhD


<!-- COLAB
TODO
Almost all researchers are trying to write great papers; if you have an idea they could help with, you'd be surprised how often a simple email works: "Hi [person], I am working on [project] and have done [steps 1-3]. I am now working on [problem] and believe [your work] would help. Would you be open to meeting to discuss?" Or, another format, "Hi [person], I saw that in your [paper] you proposed [problem]. I have solved [steps 1-3] and believe that with your help we could address [step 4,5]. Would you be open to meeting to discuss?"

Very actionable. SHow that you have done some work and show you acknowledfe their work. No one wants to work with someone who is going to waste their time or not do any work. But everyone is happy to jump on a collaboration while its near the end. email someone a solution to a problem they appear interested in, you're far more likely to get a reply (or even a paper) than if you just send an email "I love your work can we collaborate". Send only when you have something to ask. Not just lets collab
 -->


A PhD is designed to be individual. You own the problem, you defend the thesis, your name sits first. Collaboration can feel optional, sometimes even like a distraction from the “real” work.  I think that’s a darn shame. Done well, collaboration is one of the strongest accelerators in a PhD. You borrow strengths you do not have. You contribute strengths others lack. When ownership is clear and incentives align, progress compounds. But this does not happen automatically. 

I was lucky to do my PhD at Idiap Research Institute, a place small enough to talk to almost anyone over coffee, but broad enough to span NLP, speech, vision, graphs and more. The environment made collaboration easy, but ease alone is not enough. Some projects thrived because the structure was right. Others struggled as they scaled. 

**Overview** I want to show a few examples, from small, tight teams to large, flat collaborations, and what each taught me. The lesson is not that collaboration is always good. It is that its effectiveness changes with scale, structure, and clarity of ownership.

### Torch

[**Torch**](http://torch.ch/torch3/) is one of Idiap’s older collaborations, a project that predates most modern PhDs and later evolved into what we now know as [**PyTorch**](https://github.com/pytorch/pytorch). Ronan Collobert, Samy Bengio, Johnny Mariéthoz and others built an open-source machine learning library that quietly became foundational to AI research and deployment worldwide. The technical impact is obvious.

**Rigour and Joy** What stuck with me more were the team photos. You do not see a polished product team or corporate branding. You see friends building something together. They look relaxed. Slightly chaotic. Happy. They never lost their sense of humour. At the same time, they were producing work of serious technical depth.

That combination is rare and beautiful! Rigour without joy burns people out. Joy without rigour produces little. Torch showed me that collaboration can (should?) hold both. Before structure and division of labour, there is culture. Culture is what makes people want to build together in the first place. That’s something that I really resonate with and Idiap was the perfect place to foster this.


<figure class="collab-figure" style="max-width: 600px; margin: 20px auto;">
  <img src="images/idiap/torch_meme.png" alt="Torch Team" style="width: 100%; border-radius: 8px; display: block;">
  <figcaption style="text-align: center; font-size: 14px; color: gray;">Torch founders from Idiap [Torch Library](http://torch.ch/torch3/) (top), and Idiapers of 2025 recreating for fun (bottom). [Torch paper (2002)](https://infoscience.epfl.ch/server/api/core/bitstreams/7513f344-91b6-427d-a020-7836b150a150/content)</figcaption>
</figure>

### Linear Transformers

Torch showed what collaboration can build, Linear Transformers highlights the important of careful engineering. The project started in a course at EPFL, by a small group of friends. From what I heard, the first submission actually got rejected! The idea was interesting, but the practical impact was not convincing. They could not demonstrate real speedups, and without that, the contribution felt incomplete.

Instead of moving on, they doubled down. Apoorv and Angelos rewrote the linear attention module in custom CUDA kernels to achieve actual GPU speedups! Anyone who has written CUDA knows this is not glamorous work. It is slow, brittle, slightly painful. This was before AI assistants. Just careful engineering and persistence. It was a serious commitment, and it changed the trajectory of the project.

**Impact follows good engineering** They packaged the project properly. Clean code. Clear documentation. Simple benchmarks. A proper website. You could run it. You could compare it. You could build on it. That part is easy to underestimate in research.

Making code reusable changes everything. If people can try your method without fighting your repository, they will. If they can extend it, your idea gains traction. We are not trained as engineers by default, and that is fine. But a PhD is a rare chance to learn those skills. Even modest engineering discipline can multiply the impact of a good idea.


<figure class="collab-figure" style="max-width: 600px; margin: 20px auto;">
  <img src="images/idiap/lineartransformers-batmanRobin.png" alt="Apoorv and Angelos" style="width: 100%; border-radius: 8px; display: block;">
  <figcaption style="text-align: center; font-size: 14px; color: gray;">I made this depiction of Apoorv and Angelos. I am fairly certain this was how it looked when they were working on Linear Transformers. [Paper](https://proceedings.mlr.press/v119/katharopoulos20a.html), [Website](https://linear-transformers.com/), [Code](https://github.com/idiap/fast-transformers), [Video](https://www.youtube.com/watch?v=hAooAOFRsYc).</figcaption>
</figure>


### Hypermixer

Torch showed culture. Linear Transformers showed engineering. Hypermixer was the first time I felt both come together. 

We were inspired by [MLP-Mixer](https://proceedings.neurips.cc/paper/2021/hash/cba0a4ee5ccd02fda0fe3f9a3e7b89fe-Abstract.html). A simple and clean idea. Mix across tokens *and* mix within tokens. Only MLPs and transposition. No attention. It worked for fixed-size images and the obvious question was whether the same simplicity could survive in language. Spoiler... Nope. Language has variable sequence lengths. Fixed mixing meant padding everything to a constant size. That does not scale. What looked elegant in vision became awkward in NLP. 

**The breakthrough was not adding complexity, but preserving simplicity** Let hypernetworks generate the right-sized matrices on the fly. And boom! The mixing across tokens is dynamic, similar in spirit to attention. The same function could handle any input length. The model stays fully MLP-based and linear in sequence length rather than quadratic. In that sense, HyperMixer became a natural complement to linear transformers. 

What stayed with me was not just the approach of simplicity, but the team dynamic. A small group, short time-frame, simple idea and fun curious ethos. That process led to my first published paper! My first real collaborative win.

<figure class="collab-figure" style="max-width: 600px; margin: 20px auto;">
  <img src="images/idiap/hypermixer-avengers.png" alt="Hypermixer Team" style="width: 100%; border-radius: 8px; display: block;">
  <figcaption style="text-align: center; font-size: 14px; color: gray;">The Hypermixer team assemble. [Paper (ACL 2023).](https://aclanthology.org/2023.acl-long.871/)</figcaption>
</figure>

"*Make everything as simple as possible, but not simpler.*" - Apparently Einstein.

### Abstraction with NVIB

Hypermixer taught me that small teams can take a simple idea far. This project was the first time I tried to design that dynamic deliberately.

I initiated it with Melika as a one-month experiment. The question was focused: could we use the explainability properties of NVIB to induce useful abstract representations? We agreed on the scope early and split the work cleanly. I handled modelling, training, and design. She owned the data, evaluations, and interpretation. Clear ownership. Minimal overlap. Very little friction.

The structure made the difference. Because responsibilities were explicit, we did not step on each other’s toes. Decisions were fast. Feedback loops were short. In one month, we had a short paper accepted at EMNLP showing that NVIB can induce useful, sparse abstract representations. We shared first authorship. A small paper, but tightly executed.

What stayed with me was how powerful constraint can be. Two people. One month. Clear roles. Complementary skills. No ambiguity about who does what. **Clear division of labour lets small teams move fast and go deep.**

<figure class="collab-figure" style="max-width: 600px; margin: 20px auto;"> <img src="images/idiap/abstractNVIB-nemo.png" alt="AbstractNVIB Nemo" style="width: 100%; border-radius: 8px; display: block;"> <figcaption style="text-align: center; font-size: 14px; color: gray;"> Two researchers. One mission. Just keep collaborating. Finding NVIB [Paper (EMNLP Findings 2023).](https://aclanthology.org/2023.findings-emnlp.106/)</figcaption> </figure>

### Fine-Tuning with NVIB

Abstraction with NVIB showed me how powerful small, tightly designed teams can be. **This project was my attempt to scale that idea across the research institute**.

Idiap made that possible. Multiple research groups, spanning NLP, speech, and vision. I proposed a institution-wide collaboration around NVIB (my PhD project haha), applying the same core idea across modalities. I was first author and coordinator, connecting the method to each model, while each student owned one experiment. On paper, the division of labour was clear.

**What worked was the collective learning**. People helped each other across domains. Tools were shared. Pipelines were explained. We all learned a lot! I gained exposure to new areas, especially speech, and learned what different communities value. We produced a unified multiple modality paper, accepted as an ICLR workshop paper. The breadth was real, and so was the collective growth.

**What did not work was the structure.** There were eight PhD students and three supervisors, but no hierarchy or sub-teams. I became the central node for communication and technical integration. Every insight flowed through me, had to be adapted across each pipeline, and passed back out. Remember no agents for this. The coordination overhead grew quickly. Clear ownership was not enough at this scale. Depth suffered, and focus diluted. **As teams grow, structure must grow with them. Without hierarchy, coordination becomes the bottleneck.**


<figure class="collab-figure" style="max-width: 600px; margin: 20px auto;">
  <img src="images/idiap/justiceLeagueNVIB.png" alt="Justice League" style="width: 100%; border-radius: 8px; display: block;">
  <figcaption style="text-align: center; font-size: 14px; color: gray;">Justice League assembles. [Paper (ICLR Workshop 2025).](https://openreview.net/forum?id=eX0VFgG4IS)</figcaption>
</figure>


### SYNTH*IA* 

**This collaboration felt like a synthesis of everything I had learned.** Torch had shown me that rigour and silliness belong together. Linear Transformers and Hypermixer reinforced that clever engineering works best when the idea stays simple. The NVIB projects taught me that small teams with clear roles move fast and go deep. With SYNTH*IA*, an entrepreneurial hackathon project, it all of that came together. But this time the fuel was different. It was passion, fun, and cool.

**The idea itself was deliberately simple.** Model live music generation as a conversation. Use current current language modeling technology to perform a musical dialogue with MIDI tokens. That framing allowed us to reduce the problem complexity and make it faster. Using keyboard MIDI to keyboard MIDI allowed for low latency and a clean pipeline. No audio or background noise modelling. No unnecessary complexity. To keep latency low and the demo stable, we simplified even further. The demo was not even a true language model or next token predictor but actually just some clever rules syntheized by Laurent! A tight loop we could actually play live. Simplicity made it buildable and playable.

**What made it work was the team.** Three friends aligned by passion, with complementary strengths and high trust. Laurent brought technical pragmatism and serious musicianship. He grounded ambitious ideas and turned them into our working prototype. Karl has unmistakable “Steve Jobs” energy, obsessed with product feel, design, and the nostalgic retro-electro-synth aesthetic. His room was a studio in both senses of the word. I took the role of glue and storyteller, shaping the pitch, keeping us aligned, and maintaining momentum. I brought homemade lasagne, lava lamps, and ridiculous speedy sunglasses to keep the vibes high. There was no ego. We trusted each other. We took breaks and played music together. It felt less like a startup and more like a band.

<figure class="collab-figure" style="max-width: 500px; margin: 20px auto;">
  <img src="images/idiap/AlbumCover.png" alt="SYNTHIA band album cover" style="width: 100%; border-radius: 8px; display: block;">
  <figcaption style="text-align: center; font-size: 14px; color: gray;">SYNTH*IA* Album Cover: The first AI band member that JAMS with you. On Demand. Interactive. Creative.</figcaption>
</figure>

**ICC ‘appiness.** This happened inside the entrepreneurial Idiap Create Challenge (ICC), a ten-day sprint to build an AI startup from scratch. Build the product. Test it. Pitch it. Demo it. The pressure was electric! Retro synths. Gameboy nostalgia. *Jump* and *Hey Jude* reborn through AI and MIDI generation. We approached it with a “*yes, and*” improv attitude. I met with a mentor and asked how to sell this idea? “*It’s easyyy,*” he said in a French accent, “*you are sel-ling ‘appiness!*” Then I asked why it should be in Valais, Switzerland? “*It’s obvious,*” he said while my face was blank, not finding it obvious at all. “Valais is the ‘eart of cul-ture, and music is cul-ture.” I remember standing there, slightly stunned, thinking he might actually be right. During the final demo, the room felt it. So did we.

<div class="phd-card-group">
  <a href="https://www.youtube.com/watch?v=Vhwi-pR9_wg" target="_blank" style="text-decoration: none; flex-shrink: 0;">
    <div class="phd-card">
      <div class="phd-card-img-container">
        <img class="phd-card-img" src="https://img.youtube.com/vi/Vhwi-pR9_wg/hqdefault.jpg" alt="Speaking and Presentation">
      </div>
      <h4 class="phd-card-title"> H2025 SYNTH*IA*</h4>
      <p class="phd-card-desc">Demo: Idiap Create Challenge</p>
    </div>
  </a>
</div>

**We did not optimise for winning. We optimised for joy.** And we won first place! The cash prize of 15,000 CHF was secondary (and nice). What I am most proud of is how it felt. *It gave me shivers while writing this.* Friends doing something we genuinely loved, under pressure, without losing the fun. Silly and simple, yet effective. Viktor Frankl wrote that success, like happiness, cannot be pursued, it must ensue. This collaboration made that concrete for me. When the work is energising and meaningful, success tends to follow quietly (but with funky retro synths) behind.

<figure class="collab-figure" style="max-width: 500px; margin: 20px auto;">
  <img src="images/idiap/synthia_winning.jpeg" alt="SYNTH*IA* team winning the Idiap Create Challenge" style="width: 100%; border-radius: 8px; display: block;">
  <figcaption style="text-align: center; font-size: 14px; color: gray;">Idiap Create Challenge 2025 winners.</figcaption>
</figure>


### Takeaways

A PhD is designed to be individual, but the most meaningful parts of mine were collaborative. Collaboration does not work by accident; it requires clear ownership, shared incentives, and deliberate design. Small teams thrive on trust, complementary strengths, and a genuine “yes, and” energy. As teams grow, structure must grow with them, or coordination quickly becomes the bottleneck. And in the end, the collaborations that mattered most were the ones driven by passion and curiosity rather than output metrics.

**What collaboration taught me:**

- Design ownership early and make roles explicit.
- Engineer for usability if you want ideas to spread.
- Keep teams small for depth and speed.
- Add structure and hierarchy as you scale.
- Work with people you admire and trust.
- Optimise for meaning; success tends to ensue.


## Paper writing 

### Conference Paper Writing

**Conference Paper Style** writing is a skill you need to learn deliberately. Conference papers have a certain "look", a flow, a structure, a language, a density of citations and a style of figures that the community expects. Andrej Karpathy joked about this in his blog, a typical ML paper has a one-page introduction, a polished pull figure, a technical section with some maths, bold numbers in tables, one cute extra experiment, a dense related work section, and exactly the page limit with not a line to spare. It's funny because it's true. Understanding the format and style is not cheating. It is learning the game.

**One Contribution** A strong paper revolves around one clear contribution. *What is that single idea that was not obvious before?* Your job is to argue that it is important, novel and supported by rigorous experiments. The introduction does most of the heavy lifting. First, explain why the problem matters. Second, explain how previous work approached it and what is still missing. Build the *moat* around why it is hard. Third, state clearly what you do. Fourth, show what properties this gives you and what your experiments demonstrate. Avoid the laundry list of “we do X, then Y, then Z”. Your paper should be a story. Every design choice should be motivated. *Why this method?* *What are the alternatives?* *What has been tried before?*You are not just describing what you did. You are teaching your reader why it makes sense.

### Publishing Strategy 
Build a safety net 🪳 then shoot for the stars 🚀. During PhD shooting for a spectacular 8 out of 10 research paper is nice in theory but could be risky at first. I recommend the '*Cockroach Paper*' strategy to start. This allows you to get enough papers to secure your graduation and then provides a low pressure safety net for big moonshot ideas. The *Roach* paper is hard to kill which will get consistent 5s and 6s. It is solid work with careful ablations and no overclaiming. Reviewers in general are incentivised to find reasons to reject, so don't make it easy. Make sure your claims are precise and backed by evidence. A nice trick is to read papers in your niche and read their reviews if you can. Notice what reviewers praise and what they criticise. Different venues have different styles, so learn to *chameleon* your paper accordingly. Put extra analysis and anticipated objections in the appendix. Set internal deadlines and let your group review your draft as if it were a conference submission. Then you submit.. and you will likely be rejected. This is normal. But listen to reasonable feedback, make the obvious fixes, ignore the other noise and **resubmit**. Its not worth waiting for perfection as its a competitive game and there is luck involved. Your job is to remove any avoidable weaknesses and keep moving. Now that you have a few papers supporting you 🪳, its time to take-some-time and think about the starship big ideas. What ideas will stand the test of time? If they work you're famous! If not, who knows, you might miss and get to the moon? 🚀

<div style="display: flex; justify-content: center; margin: 4px 0;">
  <figure style="margin: 0; text-align: center; max-width: 420px;">
    <img src="images/idiap/roach-to-rocket.png" alt="Roach to Rocket" style="width: 100%; border-radius: 8px; display: block;">
    <figcaption style="font-size: 13px; color: gray; margin-top: 6px;">Build the Roach 🪳. Then Launch the Rocket 🚀. Secure survival. Then take bold swings.</figcaption>
  </figure>
</div>

Thats an ideal. Ironically I did this in reverse. My supervisor and I took 2 years to publish his [moonshot idea](https://openreview.net/forum?id=6QkjC_cs03X) and after I roached the rest haha 🪳.

### Thesis writing

A thesis should not just be a collection of your papers (ideally). My supervisor described it as a single-author document that should transcend them. It should tell the story of your research and the themes that connect your work. It should not read like an ending of this work, but the beginning of what comes next. What questions are still important? What ideas matured over time? Think about how it will read in ten years. I used short chapter summaries and links to make mine easy to skim, and kept a consistent visual theme across figures and plots so it felt intentional. (Mine is [here](https://infoscience.epfl.ch/entities/publication/dad86ab3-09eb-48bf-b6d4-8c3d903eb94d) if you are interested) The thesis should feel coherent, not stitched together. Thesis writing it is stressful, but the principle is simple. Decide on the structure early and start writing. Then keep writing. It is easier to edit than to begin. There will always be another experiment you could run, but at some point you must draw the line.


<!-- Writing papers:

Essential skill you will need to learn. They look a certain way. They flow a certain way the language statistics, figures. Review is important. You get to see many papers. Good and bad and learn from both. 

HAHA from Kaparthy. Wow 10 years ago he nailed this.

An introduction of ~1 page. A ~1 page related work section with a good density of citations - not too sparse but not too crowded. A well-designed pull figure (on page 1 or 2) and system figure (on page 3) that were not made in MS Paint. A technical section with some math symbols somewhere, results tables with lots of numbers and some of them bold, one additional cute analysis experiment, and the paper has exactly 8 pages (the page limit) and not a single line less. **(written in 2016) -** Intro, Related Work, Model, Experiments, Conclusions.

What is the single core contribution of the paper. Sells the idea that wasnt obvious before. Argue its important, novel, your experiments have rigour and merit and that the reader should care. 

I like to organize each of my paragraphs around a single concrete point stated on the first sentence that is then supported in the rest of the paragraph. Easy to skim HOW TO SPEAK 

Intro is very important.

1st paragraph. The problem is important. why should you care.

2nd Previous work addresses this as follows… but has problems still of… (building the moat of why your idea is unique) Why is it hard. Why hasnt this been solved before

3rd in this work we do.

4th This gives us the properties of… and our experiments show…

Avoid the **the laundry list.** Here is the problem. Okay now to solve this problem first we do X, then we do Y, then we do Z, and now we do W, and here is what we get. Your paper should be a story. That is motivated why someone should care. Each point should be justified, motivated, explained. Why do you do X or Y? What are the alternatives? What have others done? It’s okay to say things like this is common (add citation if possible). It is supposed to teach your colleagues something and you have to justify your steps, not just describe what you did.

An internal deadline. 2 weeks before for the group to review. they then review like a conference and give feedback.

- Check out https://cs.stanford.edu/people/widom/paper-writing.html

**How to publish a paper?** Write papers that cannot be rejected. For me I would never get 8/10 reviews. Always 5 and 6. Not big breakthroughs but consistent, solid work with rigourous abalations and logical not overclaimed solutions.  

- They are incentivised to reject your paper easily. Do not give them this. Make sure your claims are not overstated, clearly backed by experiments
- So read papers. Read in your niche and read the best papers and their reviews. Why were they good? What did the reviewers like and not like? How do these papers look? DIfferent conferences have different styles. so you need to chameleon your paper to not make the paper look out of place. Writing style, their experiment structure, theoretical foundations. No obvious critisism. For me this was the FAT appendix. Any extra question or thought you have. Put in that appendix.
- Dont take it to heart if you are rejected. Do your best. Listen to reviewers within reason make the obvious and easy edits and then **resubmit** but do not fall into the trap of slogging and redoing the work until its perfect. Its never perfect. You need to move on approx 8 months
- Reviewers are like you (Most of the time they are exactly like you) they dont have time. They dont read properly they critisise and things to get it rejected. You are misunderstood. Resubmit. Reviewer number 2 will come for blood.
- YOU NEED LUCK actually. Look at the distrubution of scores and acceptances.

Roach papers

### Thesis writing

SIngle author. How will this transend time? Not just a colleciton of your papaers but a story of youre research. What themes are important. What will remain important. Its not the end but the start.

LOOK at my thesis. 

I used summaries of paper and links to make it easy to skim

I also kept a theme for all my figures, graphs and plots. SO this is why the pallet is nice. 



Thesis writing: stressful more experiments. Start writing. Decide structure. Keep writing. Easy to edit not easy to start. -->


## Speaking and Presentation


**Promise** By the end of this section, you will consider talks, posters, slides and communication differently. Look at these two posters side by side. Which one do you like more? Which one would you ignore? Why?

<div style="display: flex; gap: 16px; justify-content: center; align-items: flex-start; margin: 24px 0; flex-wrap: wrap;">
  <figure style="flex: 1; min-width: 260px; margin: 0; text-align: center;">
    <a href="images/idiap/posters/NVIB_poster1.pdf" target="_blank" rel="noopener noreferrer">
      <img src="images/idiap/posters/NVIB_poster1-1.jpg" alt="Dense NVIB poster (early PhD)" style="width: 100%; border-radius: 6px; border: 1px solid var(--border-color); display: block;">
    </a>
    <figcaption style="font-size: 13px; color: var(--muted-color); margin-top: 6px;"> My first conference poster ICLR2023</figcaption>
  </figure>
  <figure style="flex: 1; min-width: 260px; margin: 0; text-align: center;">
    <a href="images/idiap/posters/Coret_poster4.pdf" target="_blank" rel="noopener noreferrer">
      <img src="images/idiap/posters/Coret_poster4-1.jpg" alt="Simple CoRet poster (later PhD)" style="width: 100%; border-radius: 6px; border: 1px solid var(--border-color); display: block;">
    </a>
    <figcaption style="font-size: 13px; color: var(--muted-color); margin-top: 6px;">My last conference poster ACL2025 </figcaption>
  </figure>
</div>

**The two posters** The first was from the beginning of my PhD. Dense blocks of text. Small fonts. Every corner filled. I was trying to summarise the entire paper into the poster. Maybe I was trying to prove I was intelligent or maybe I wanted every detail there in case someone asked a difficult question. The second came years later. One central message. Large type. Space to breathe. A clear visual hierarchy. What actually matters at a conference is simpler. Do they look, skim, and think “*that’s interesting, let’s talk*”? Or do they snap a picture and say “*thanks, I’ll read the paper*”? Thats what really matters for that audience. A QR code to make the next step effortless. I was no smarter when I designed the second one. The research had not suddenly become revolutionary. What changed was some simple design. The quality of my ideas did not change dramatically, but the way I communicated them did.

**In the next sections, I will show why communication is not cosmetic but survival.** We will zoom out from posters to interviews, talks and industry. Then we will look at the structural principles behind great speaking, the psychology of persuasion, and the practical design rules that reduce cognitive overload. 


### Communication is everywhere

**Communication is leverage, and you feel its absence immediately.** Have you ever fumbled an interview and walked out thinking, “that is not what I meant”? Sent an email that landed badly? Tried to explain how you felt to someone close to you and watched them misunderstand you completely? You ask a question and they look at you as if it is obvious, then answer something entirely different... Yup, I see you. We have all been there. Its most likely communication. Posters were simply my most visible example, but this is not a conference problem. It is a human one.

The scientist in me would like to believe good ideas win on merit. In practice they might, but often slowly and painfully. Clear, well framed ideas travel faster. Ideas that are easy to grasp, repeat and explain to someone else are the ones that move. This is less about theatrics or charisma and more about reducing friction between your thinking and someone else’s understanding. Machine learning conferences just make this brutally obvious. Hundreds of posters. Ten minute talks. Reviewers skimming at speed. If they do not understand what you are doing and why it matters within seconds, they move on. And they will not come back.


### How to speak

**Great speaking is designed, not improvised.** I only realised this after watching Patrick Winston’s talk *How to Speak*. It is possibly one of the greatest showcases of talk design I have ever seen. He is not a charismatic showman or a stand-up comedian, though he knows exactly when to use those elements. He treats a talk like an engineered system. Start with a promise. Tell people what they will gain. Answer the elephant in every room… *Why should I care?* Failure to situate the problem is failure before you begin. Make them care about the problem before you show them the solution. Then cycle your main idea so it cannot be missed. Build a fence around it so it is not confused with nearby ideas. Design the ending so your contribution is the last thing left in the room. The best performance is great architecture.


<div class="phd-card-group">
  <a href="https://www.youtube.com/watch?v=Unzc731iCUY" target="_blank" style="text-decoration: none; flex-shrink: 0;">
    <div class="phd-card">
      <div class="phd-card-img-container">
        <img class="phd-card-img" src="https://img.youtube.com/vi/Unzc731iCUY/hqdefault.jpg" alt="Speaking and Presentation">
      </div>
      <h4 class="phd-card-title"> How to Speak</h4>
      <p class="phd-card-desc">Professor Patrick Winston (MIT)</p>
    </div>
  </a>
</div>

**The job of a talk is to reduce cognitive friction.** Fewer words. Larger fonts. Think of white space as garlic 🧄 more is usually better. Slides expose ideas, they do not teach them. Boards are for teaching. One genuinely hard idea per talk. That’s it. More and people drown. Use verbal punctuation. Tell them there are three things. Say the three things. Then remind them what the three things were. When talks are long, show the outline. Let people know where they are. People fog out and come back in waves, so design for that reality. Machine learning talks are perfect examples. Many start broad and gentle, then whoops, you fall off a mathematical cliff and half the room is lost. Structure keeps your idea intact long enough for someone to actually understand it. But structure alone is not enough.

**If your idea does not have a handle, it will not travel.** In a sea of papers, posters and talks, abstraction blurs. People remember what they can name. Patrick Winston captured this in the “5 S’s” of a strong intellectual brand:

- **Symbol** – a visual anchor  
- **Slogan** – a repeatable handle  
- **Salient idea** – clearly distinct from near misses  
- **Surprise** – something memorable  
- **Story** – how it works and why it matters  

Think “one-shot learning” or “attention is all you need”. They stick because they are graspable. If your work cannot be summarised cleanly in a sentence, it will struggle to survive outside your lab notebook. Salience is compression. A symbol to anchor the idea. A slogan to repeat it. A clear difference. A memorable example. A story that carries it forward. Five clear words often travel further than fifty clever ones.

When I worked on [CoRet: Improved Retriever for Code Editing](https://aclanthology.org/2025.acl-short.62/), I experimented with this. I originally used a golden retriever as the symbol. Gold suggests first place. A retriever dog is loyal and fetches things. The slogan: “A dev's best friend.” The story writes itself. Cody fetches the right code for you. Branches, files, functions... brought back faithfully. It did not survive internal branding discussions, but the exercise mattered. It forced my clarity, colour palete and design. Funnily enough, they all remember Cody. Few remember CoRet.

 <figure style="max-width: 280px; margin: 20px auto; text-align: center;">
    <img src="images/idiap/Cody.png" alt="Cody the golden retriever" style="width: 100%;
   border-radius: 8px; display: block;">
    <figcaption style="font-size: 13px; color: var(--muted-color); margin-top:
  6px;">Cody the golden code retriever. “A dev’s best friend”. People still remembered the dog. </figcaption>
  </figure>

When people can repeat your idea accurately, it begins to live independently of you. That is when it travels.


<div class="phd-card-group">
  <a href="https://www.youtube.com/watch?v=hopcdZLD2ek" target="_blank" style="text-decoration: none; flex-shrink: 0;">
    <div class="phd-card">
      <div class="phd-card-img-container">
        <img class="phd-card-img" src="https://img.youtube.com/vi/hopcdZLD2ek/hqdefault.jpg" alt="Coret presentation">
      </div>
      <h4 class="phd-card-title"> CoRet: Improved Retriever for Code Editing</h4>
      <p class="phd-card-desc">Fabio Fehr </p>
    </div>
  </a>
</div>


### How to Win Friends and Influence People

**People care about their world more than they care about your problem.** I said it. It’s there. Soak that in. You might have spent three years on a question that keeps you awake at night. The person in front of you is thinking about their deadlines, their work, their dinner tonight, and that silly cat video they watched. If you do not translate your idea into their world, it will not land. Frame your work in terms of what they care about. Cite generously. Acknowledge the shoulders you stand on. Remember names. Smile when you meet someone. These are not soft skills. They reduce resistance. Once someone feels seen and respected, they are far more willing to listen.

<div style="display: flex; justify-content: center; margin: 20px 0;">
  <a href="https://en.wikipedia.org/wiki/How_to_Win_Friends_and_Influence_People" target="_blank" rel="noopener noreferrer">
    <img src="images/idiap/dale_carnegie_book.jpg" alt="How to Win Friends and Influence People — Dale Carnegie" style="width: 160px; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
  </a>
</div>

**Influence is not manipulation. It is empathy applied to ideas.** Carnegie’s core message is simple: arouse an eager want. Show what becomes possible. And care about it. People are attracted to conviction. If you are not genuinely interested in your own work, it is very hard to convince anyone else to be. Passion does not mean theatrics. It means you believe the problem matters. In a job talk, that means vision before detail. In a conference talk, it means situating your contribution clearly. Do not attack related work to make yourself look stronger. Extend it. Clarify it. Let people save face in discussion. Curiosity beats ego. You get used to criticism. You never get used to being ignored. If you care about your ideas surviving in the real world, read *How to Win Friends and Influence People* and think about how it applies to your research life, and the rest of your life.

### Posters and slide design

**Design is respect for human attention.** A poster is not a paper shrunk to A0. It is an invitation. One central message. Clear visual hierarchy. Large fonts that can be read from a distance. Space to breathe. (The garlic 🧄 whitespace). Remove decorative clutter. If something is there, it should earn its place. Print it out. Step back. Squint. What survives? That is your message.

**Your job is to lower cognitive load.** One genuinely hard idea. That’s enough. Everything else either supports it or gets removed. In practice, this means graphics over paragraphs. Short phrases over dense blocks of text. A QR code for depth so people can snap and read later. Boards teach. Slides expose ideas. But, posters are magnets. They pull people into conversation or toward your paper. People have limited bandwidth, especially in a conference hall at 4pm. Design for that reality. The “Better Poster” movement captures this well: clarity first, hierarchy second, detail on demand. Respect human cognitive overhead, and your ideas will travel further.

<div class="phd-card-group">
  <a href="https://www.youtube.com/watch?v=SYk29tnxASs" target="_blank" style="text-decoration: none; flex-shrink: 0;">
    <div class="phd-card">
      <div class="phd-card-img-container">
        <img class="phd-card-img" src="https://img.youtube.com/vi/SYk29tnxASs/hqdefault.jpg" alt="Better Poster">
      </div>
      <h4 class="phd-card-title">Better Poster</h4>
      <p class="phd-card-desc">Mike Morrison</p>
    </div>
  </a>
</div>


### Criticism and responsibility

**Criticism is engagement.** If someone takes the time to question your assumptions, challenge your results, or push back on your framing, they are spending cognitive energy on you. That is not hostility. That is attention. Indifference is far worse. You get used to criticism. You never really get used to being ignored. Separate your ego from the idea. The idea can be refined. The idea can be sharpened. Drink that juicy feedback nectar.

**You are responsible for how your ideas enter the world.** Do not hide behind dense slides and then blame the audience. Do not end with a weak “thank you” and hope they remember your contribution. Summarise it. Stand behind it. Make it clear enough that someone else could explain it after you leave the room. Share it properly. Build on others generously. Communication is not decoration added at the end of research. It is part of the research. If your ideas matter, design how they travel.

## What was it like doing a PhD in Martigny at Idiap?

<span style="display: inline-block; background: #f59e0b; color: #fff; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 3px 10px; border-radius: 12px;">🚧 Work in Progress</span>


This section goes deep and personal.

- Language learning, skiing, friends and community, coffee breaks, ICC, Scifilmit, marathon running, swimming, playing squash, Hiking, learning to drive and driving a car in Switzerland The license is international and never expires!, local culture. Friends. Silly jokes, Productivse procrastination-  MEDS gardening in the office. cooking. sports. organsising social events braai bowling lazer tag. this is me but not necessary what works for everyone.

<div class="phd-card-group">
  <!-- Most Uncertainly -->
  <a href="https://www.youtube.com/watch?v=Gm_JDGQxTdQ&t=684" target="_blank" style="text-decoration: none; flex-shrink: 0;">
    <div class="phd-card">
      <div class="phd-card-img-container">
        <img class="phd-card-img" src="https://img.youtube.com/vi/Gm_JDGQxTdQ/hqdefault.jpg" alt="Most Uncertainly">
      </div>
      <h4 class="phd-card-title">2021 Most Uncertainly</h4>
      <p class="phd-card-desc">SciFilmIt Hackathon</p>
    </div>
  </a>

  <!-- SYNTH*IA* -->
  <a href="https://www.youtube.com/watch?v=Vhwi-pR9_wg" target="_blank" style="text-decoration: none; flex-shrink: 0;">
    <div class="phd-card">
      <div class="phd-card-img-container">
        <img class="phd-card-img" src="https://img.youtube.com/vi/Vhwi-pR9_wg/hqdefault.jpg" alt="SYNTHIA">
      </div>
      <h4 class="phd-card-title">2025 SYNTH*IA*</h4>
      <p class="phd-card-desc">Idiap Create Challenge Hackathon</p>
    </div>
  </a>
</div>

## Tools, Coding Tips and AI assistants

<span style="display: inline-block; background: #f59e0b; color: #fff; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 3px 10px; border-radius: 12px;">🚧 Work in Progress</span>

TODO: Coding assistents are great. You need to be using them as best as you can to be giving yourself the best chance. Something cool I did while writing this was to use assistants to help me build system prompts to other systems. This then built in planning and editting modes. I also gave it my writings to help with my style and voice and preserve this. I think our voice and thoughts are the unique juice of the communication. If we lose that the writing becomes stale. Less authentic. No groovy fun of personality that they so desperately need. It should be fun to write. 

Interesting the same things apply to coding assistants. pick the most common one. Become a master and know your tool well. I then used writing this blog as a way to experiment and try different things.
https://learn.deeplearning.ai/courses/claude-code-a-highly-agentic-coding-assistant/lesson/vvq28/creating-web-app-based-on-a-figma-mockup


**Coding Tips** Code is part of your research contribution. If you want your work to be reproducible, release it and do not reinvent the wheel. Use widely adopted libraries such as [PyTorch](https://github.com/pytorch/pytorch), [PyTorch Lightning](https://lightning.ai/docs/pytorch/stable/) and [HuggingFace](https://huggingface.co/) so others can run, compare and extend your ideas easily. I treated each project as an iteration. With every release I tried to improve structure, documentation and reproducibility. At the same time, treat engineering as a skill. Understand your compute, clusters and tooling. Take debugging seriously. Print and plot activations and gradients. Do some unit tests, I used [pytest](https://docs.pytest.org/en/stable/). Do simple sanity checks like "*Can my model overfit?*". Use experiment trackers such as [WandB](https://github.com/wandb/wandb) and visualise training whenever possible. Build small demos with tools like [Gradio](https://github.com/gradio-app/gradio) to make ideas tangible. Good software engineering is how nice research ideas move to real useability.

**AI Coding Assistants** Coding is changing. Higher levels of abstraction are emerging, from assembly to C to Python, and now to prompting ([Software 3.0 and vibe-coding by Andrej Karparthy](https://www.youtube.com/watch?v=LCEmiRjPEtQ)). The level of abstraction keeps rising and the barrier to building is getting lower. This is incredible, but I believe understanding the fundamentals will become increasingly important. AI assistants are tools that accelerate writing, scaffold code or challenge/review your reasoning. **Do not let them replace your thinking**. Form your own hypotheses. Do the maths. Design the strategy. Whatever you put out there is ultimately your responsibility. Use these tools to do more, but not to think less.
<!--
 Release code. Make it use the biggest most widely adopted libraries and tools. During my time Think huggingface, transformers, pytorch. Pytorch lightning. Make sure its use is easy to change, and compare. This will make your idea adoptions easier. Being new to coding myself this took me some time to get going and i still try and improve on this each iteration.
Each paper is an iteration. Get better learn and move forward.
- Take time to learn the systems. Get excited about how to get more compute. We all created our own submitters to the grid. Mine had emojis.
    - Visualise your models training. Visualise the gradients. Visualise the maps, dive deep into what the hell this thing is doing
    - Debugging! -  Visualise. Also print everything show everything gradients, wandb for training. Pytorch lightning. DOnt reinvent
    - Make things simply usable - get good at the software engineering. If people can use it. they may not be able to understand like a cars engine they will build it forward, more citations  more impact more success as a researcher. Hopefully your writing too is good and visuals so people grasp it soon.
AI assistants - This only came in at the tail end of my PhD but it is now a defacto. I would say they are tools. But do not let them replace your skills. Writing word for word. Thats great. brain storming great. But they are no replacement for your thought. I believe you should generate hypothesis and opinions and ideas. These things help you bring it to life from a code or writing perspective. Ie reviewing. Read the paper. Make your own notes then form your judgements and ideas use llms to help you find biases or structure your thoughts but the thoughts are your own. Same with code. Your idea to code soemthing. DO the math do the high level stragy but the model can help you speed up implementation and back and forth with you for robustness. Whatever it generates I think you are liable. Make sure you know whats going on. 
-->


## Publishing and dealing with reviews

<span style="display: inline-block; background: #f59e0b; color: #fff; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 3px 10px; border-radius: 12px;">🚧 Work in Progress</span>


Reviews. Can feel random, unfair, dont take it personally


## Reviewing 

<span style="display: inline-block; background: #f59e0b; color: #fff; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 3px 10px; border-radius: 12px;">🚧 Work in Progress</span>


You will be asked to review. You need to set the bar. You gain nothing. But write the review you would like to recieve. DO you actually add value to their paper. DOes it make it better. How could your score be improved. Dooo it. Helps you understand. Makes you a better author and community member

Reviewers know this and are signaled if you dont.  You read many papers. Some are excellent. Some are weak. You learn from both. 

But dont be reviewer 2!

## Teaching

<span style="display: inline-block; background: #f59e0b; color: #fff; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 3px 10px; border-radius: 12px;">🚧 Work in Progress</span>


Teaching. Take it seriouslty. Actually the people you know will one day be working with you. Try and uplift them. You will gain by being helpful and giving them your time. I know your time is a scarce resource, but remember kindness is free and invaluable to receive.

Teaching: Bachelors - simple - Perfection is a trap. Learn to keep it simple. Make material for others.

## Conferences

<span style="display: inline-block; background: #f59e0b; color: #fff; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 3px 10px; border-radius: 12px;">🚧 Work in Progress</span>


Conferences. They are about the people. Meet and discuss. Make a friend. Those friends will be waaaay more valuable than any subject matter. Maybe it inspires a new idea. or a new zeitgeist of where the field is moving but its often delayed. Panels are cool. They are discussing things they a=care about now. Summerschools! meet the commuinity. Ask to go early. I got lucky to go to ACL early after COvid.

Dont linkedin lur ch. Be open and build authentic connections with people. The next step will be working together and doing great work. In that order. Dont meet people to get something out of them. Meet and talk to people conference. Not for your own benefit. You can learn alll sorts that you could never learn through a talk or paper. Experiements that dont work ect.

Conferences. Speak to people you admire. You could embarass yourself and they ignore you. But lol they would do that anyway. I doubt they will hate you. Cold emailing can work. But make it about them, no one wants an email that gives them more work. They want emails that give them interesting opportunities (How to win friends and influence people).

## Internships and interviewing

<span style="display: inline-block; background: #f59e0b; color: #fff; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 3px 10px; border-radius: 12px;">🚧 Work in Progress</span>


What are interships for? This is an important question. Is it for job security after? Is it for growing your research profile? Is it to explore ideas you couldnt have in academia? Is it for a new perspective outside of academia? I wrote a blog on this. But the main thing is that they allow you to grow in a way that academia doesnt allow for. I got to see the pressure, heirarchy, incentives of a larger company. I didnt like it and went and did a postdoc. I want agency. I want the freedom to work on big ideas. I want to steer towards what I think is important in the era of AI. I made a blog about what was valuable. But new perspective, country, environment, scaling code, priorities, germany and culture and language, growth. Its what gave me the confidence to apply for things I really wanted to do. 

Are internships useless now ? They are so product driven we are starting to see this since LLM era. They may not let you publish your work. Google used to publish all sorts and be open. Think 2017 attention based models that could be different from RNNs. It was not a big deal infact I think it was a poster at neurips no one said heeey paradigm shift coming. They didnt know and we need to explore like this to make real advancement. Real diversity. If thats what you want working with smart people on diverse ideas perhaps academia might actually be the place for now?

What you do get to see is what they dont publish. How do they do that? Published things in companies are the things that dont work... Look at the plane bullet holes thing

Internships. Yes. differnt persepective. large company. resources. cool people differnt work. Not academics whcih is a cool mindset. SO refreshing. 

Lucky to get these day so competitve

Interviewing: I think this is likely to change quite soon, but what it was like for me. First is coding, then theory of machine learning, then boss battle with the manager, how do you approach unsolved problems. 

You are first told to solve some silly coding problem with data structures no where close to your skillset for PhD. Feels like a tangential hard task that you are meant to learn to get past the gatekeepers of big tech. Its like a test of grit and determination. Ie can you learn how to do this other task which is solving puzzles as a part time thing while you are already busy with a PhD so that we see you are committed to get into these jobs. At first I didnt know this. I had interviews with Apple (classic code KNN and Kmeans from scratch. It floored me. I was so flustered that Kmeans I forgot to average to aggregate clusters doh its means haha funny how the brain works in these zones), meta, cohere (nice approach they are an online company so their tests were online. I submitted a work book of a cool analysis I did but never heard back. Thats how ), Microsoft (this went well I though, I solved the problems, showed my expertise and logically handled their problems of unstrucutred mail organising.)  ... others. They were were hard, my worst interview with amazon actually was the one that landed me the internship. In amazon theory they destroyed me on good ol fashioned theory on kernel trick to get nonlinearlity in a linear regression. Aleph alpha was more targeted on NLP which was nice as I knew what was going on but couldnt get why we we would assume a gaussian distribution give loads of data. It was the CLT theorem=, first year statistics slaps me in the face. Something I am a master of... Such a funny experience. I dont think this representative of how you solve problems. I might have access to the best answers on the spot. but I work hard and find a solution and dont give up. Ie with time I can make progress. Isnt that more important? hey ho, thats more important to me.  Tough times never last only tough people last meme.


Also everyone wants something thats wanted. Weird phenomenon I saw in job application and dating. When you have options you give off a confidence that oozes attraction. In my world when I applied to jobs after my internship I said I had an offer (even though I didnt reallly I thoyght I could get one if I wanted) But then I spoke in the interviews confidently and honestly and startwed with why. Then people wanted me. I got 2 offers from start ups and also a postdoc offer. No desperation. Green lights from mathew mcconhey. Happened when I started on hinge to date. Thats a story for another time haha. 

Confidence is the most impressive thing. A bit like dating. No one wants someone who is desperate and its unattractive in the job world too. Only when I applied things with a lack of desperation did I get more offers than before. It shows I dont need you but I want you. If others want something then we feel we should to. Having other offers in hand are super powerful for negotiation. Negotiation is always possible and recommended when you have been given the tick of approval. This standard practice and benefits the brave. Hav some gutspa. 


YES
- CV online presence and marketing?
- Apoorvs doc?

<div style="display: flex; gap: 20px; justify-content: center; align-items: flex-start; margin: 20px 0; flex-wrap: wrap;">
  <figure style="flex: 1; min-width: 280px; margin: 0; text-align: center;">
    <img src="images/idiap/tough_times.gif" alt="Tough times never last" style="width: 100%; border-radius: 8px; display: block;">
  </figure>
  <figure style="flex: 1; min-width: 280px; margin: 0; text-align: center;">
    <img src="images/idiap/tough_people.gif" alt="But tough people do" style="width: 100%; border-radius: 8px; display: block;">
  </figure>
</div>

## Conclusion

<span style="display: inline-block; background: #f59e0b; color: #fff; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 3px 10px; border-radius: 12px;">🚧 Work in Progress</span>
OO

What is unique to this story. (Mine is coming from a more 3rd world country outside of Europe. Mine is Martigny, Switzerland. Mine is timing handing COVID and multi cultures. Mine is the boom of AI and NLP ChatGPT, during my PhD. Mine is being an extrovert and craving social interaction in a very solo endevour. I am a productive procrastinator. )


Futures so bright I gotta wear shades. kid glasses gifs

<div style=”display: flex; justify-content: center; margin: 12px 0;”>
  <img src=”images/idiap/sunglasses.gif” alt=”Speedy sunglasses” style=”width: 160px; border-radius: 8px; display: block;”>
</div>

PhD of the year award



<div class="phd-card-group">
  <a href="https://www.youtube.com/watch?v=wEDG70-SO0A" target="_blank" style="text-decoration: none; flex-shrink: 0;">
    <div class="phd-card">
      <div class="phd-card-img-container">
        <img class="phd-card-img" src="https://img.youtube.com/vi/wEDG70-SO0A/hqdefault.jpg" alt="PhD Defence">
      </div>
      <h4 class="phd-card-title">2025 PhD Defence</h4>
      <p class="phd-card-desc">Nonparametric VIB</p>
    </div>
  </a>
</div>

<figure>
  <img src="images/idiap/Fabio-Jamie.jpeg" alt="PhD Defence" style="width: 100%; border-radius: 8px; display: block;">
  <figcaption style="text-align: center; font-size: 14px; color: gray;">PhD Defence: Dr Fabio J. Fehr and his supervisor Dr. James Henderson 05/09/2025  </figcaption>
</figure>


"*Again and again I therefore admonish my students both in Europe and in America: "Don't aim at success—the more you aim at it and make it a target, the more you are going to miss it. For success, like happiness, cannot be pursued; it must ensue, and it only does so as the unintended side-effect of one's dedication to a cause greater than oneself or as the by-product of one's surrender to a person other than oneself. Happiness must happen, and the same holds for success: you have to let it happen by not caring about it. I want you to listen to what your conscience commands you to do and go on to carry it out to the best of your knowledge. Then you will live to see that in the long run—in the long run, I say!—success will follow you precisely because you had forgotten to think of it.*" 

**A Man's Search for Meaning** by Viktor E. Frankl