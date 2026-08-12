---
title: "Faces First: LinkedIn’s Quiet Transformation"
date: 2026-08-12 09:30:00 +0200
author: Anna-Lena
category: AI & society
read_time: 6
slug: faces-first-linkedins-quiet-transformation
excerpt_text: "How LinkedIn’s feed became a training ground for Microsoft’s AI."
description: "Why selfies dominate LinkedIn’s feed—and how professional visibility may be feeding a uniquely valuable AI training dataset."
og_image: /assets/blog/faces-first-linkedins-quiet-transformation/cover.jpg
original_publication_date: 2025-09-07
original_url: https://paragraph.com/@alephantom1/faces-first-linkedins-quiet-transformation
---

**Why do selfies dominate LinkedIn’s feed while serious posts vanish? Because LinkedIn’s real business is not networking but data harvesting for AI training.**

LinkedIn once presented itself as the world’s professional network. Today it behaves more like a social feed where selfies outperform research, and casual updates eclipse expertise. This is not a design flaw but a feature. This shift became undeniable when [LinkedIn clarified its data use policy for AI training in November 2024](https://www.linkedin.com/pulse/understanding-linkedins-new-user-agreement-its-impact-kevin-d-turner-qqdef/)—except in Canada, the EU, EEA, UK, Switzerland, Hong Kong, or Mainland China. Under Microsoft’s ownership (since 2016), **LinkedIn is no longer just a networking site. It is a strategic data pipeline feeding now one of the largest AI infrastructures on the planet.**

The problem is not simply that selfies win more likes. It is that LinkedIn’s design choices convert professional self-presentation into a vast supply of identity-labeled training data. What looks like harmless visibility is also invisible labor for Microsoft’s AI pipeline. This raises a structural tension: users seeking reach and credibility are nudged into feeding a system that can serve both career tools and enhancing surveillance technologies.

<figure>
  <img src="{{ '/assets/blog/faces-first-linkedins-quiet-transformation/faces-stock.jpg' | relative_url }}" alt="A professional standing beside graphics representing facial analysis and personal data">
  <figcaption>Stock image by Freepik.</figcaption>
</figure>

**Human attention bias** explains why posts with faces perform better than text alone. A study of 1.1 million Instagram photos found images with faces were 38% more likely to receive likes and 32% more likely to get comments ([Bakhshi et al., 2014](http://eegilbert.org/papers/chi14.faces.bakhshi.pdf)). LinkedIn taps into this bias, ensuring selfies and personal updates outperform professional text posts. But attention is only the surface value of personal images.

**Labeled personal images are uniquely valuable for AI** because manual labeling is expensive and error-prone. As Kate Crawford has argued in the *Atlas of AI*, much of AI’s power depends on invisible human labor: annotating millions of images, often underpaid and inconsistently tagged. Mislabeling is common when crowd workers guess identities or contexts. LinkedIn solves this problem by sitting on one of the cleanest labeled datasets available: professional users voluntarily upload images tied to verified names, roles, and networks. Unlike other platforms where people may use nicknames or fake personas, LinkedIn content is aspirational and anchored in professional identity, making it unusually “truth-like” compared to Twitter, TikTok, or Instagram.

The value of these images does not stop at LinkedIn. **Microsoft operates one of the largest commercial AI stacks in the world.** Azure Cognitive Services already market computer vision APIs that can detect faces, objects, and demographics. Azure’s Face API, for instance, can detect and identify faces, compare them across images, and estimate attributes such as age and emotion. LinkedIn’s stockpile of labeled portraits slots neatly into the kinds of data such systems require. Multimodal foundation models increasingly depend on datasets where images are paired with text, names, and roles. LinkedIn provides exactly this linkage at scale: millions of faces anchored in professional context. Even if LinkedIn says it “seeks to minimize personal data” in training, identity-labeled images are exactly what enable multimodal models to align people with professions, enabling everything from résumé parsing to “find this person” search in enterprise contexts. The pipeline is commercial, not accidental.

By default, the “**Data for Generative AI Improvement**” feature is turned on for all members except those in the EU, EEA, UK, Switzerland, Canada, Hong Kong, and Mainland China. Users can opt out under Settings → Data Privacy → [*Generative AI*](https://www.linkedin.com/mypreferences/d/settings/data-for-ai-improvement).

<figure>
  <img src="{{ '/assets/blog/faces-first-linkedins-quiet-transformation/linkedin-ai-setting.png' | relative_url }}" alt="LinkedIn setting for using personal data to improve generative AI">
  <figcaption>Screenshot: LinkedIn.</figcaption>
</figure>

Because **LinkedIn rewards personal images with reach**, users seeking professional credibility are nudged into posting more of them—even when the photo neither clarifies the argument nor meaningfully supports the subject matter. Professionals who want visibility see clear evidence that posts with selfies outperform carefully argued text. The result is a platform where visual content about the person, not the problem, dominates. A sustainability consultant posting a selfie may gain more reach than sharing a chart on emissions. Over time, this reshapes professional norms: expertise becomes performative, credibility reduced to willingness to appear.

This shift has sociological weight. **Workers are pushed to self-brand visually, producing streams of labeled portraits that double as free training data.** In other terms, this is invisible labor: professionals think they are curating a reputation, but they are also curating an AI dataset. The dual-use potential is unavoidable. The same multimodal systems that refine its writing suggestions or résumé matching are structurally compatible with surveillance, policing, or facial recognition. History shows that once a capability exists, it rarely stays confined to its original justification. LinkedIn may frame the practice as engagement optimisation, but the technical affordances point further.

Other platforms demonstrate how far this can go. In 2024, Facebook admitted to scraping all public posts and photos of Australian users dating back to 2007 to train AI, with no opt-out option ([ABC News, 2024](https://www.abc.net.au/news/2024-09-11/facebook-scraping-photos-data-no-opt-out/104336170)). This is not an exception but a pattern: identity-rich images are routinely harvested for model training. LinkedIn’s boosting of image-heavy posts fits squarely within this trajectory, though with even higher data quality because of its professional anchoring.

Microsoft’s partnership with Palantir shows how its AI stack is embedded in national-security systems. On August 8, 2024, the two firms announced that Azure OpenAI models (including GPT-4) would run in classified U.S. defense environments, powering Palantir platforms across logistics and intelligence ([Microsoft News](https://news.microsoft.com/source/2024/08/08/palantir-and-microsoft-partner-to-deliver-enhanced-analytics-and-ai-services-to-classified-networks-for-critical-national-security-operations/), [Reuters](https://www.reuters.com/technology/palantir-deploy-ai-products-microsoft-azure-us-government-agencies-2024-08-08/)). While no evidence shows LinkedIn data entering defense systems, the shared infrastructure raises the possibility that datasets fueling professional tools could also enable military applications. This illustrates AI’s dual-use logic: tools built for professional utility can also serve security and defense.

<figure>
  <img src="{{ '/assets/blog/faces-first-linkedins-quiet-transformation/microsoft-news.png' | relative_url }}" alt="Microsoft announcement about its partnership with Palantir for U.S. government AI systems">
  <figcaption>Screenshot: <a href="https://news.microsoft.com/source/2024/08/08/palantir-and-microsoft-partner-to-deliver-enhanced-analytics-and-ai-services-to-classified-networks-for-critical-national-security-operations/">Microsoft News</a>.</figcaption>
</figure>

One may claim that LinkedIn’s data collection is aimed only at improving services like spam detection or job-matching. But once a model is trained, the boundary between convenience and capability dissolves. The same dataset that makes résumé recommendations smoother can also make biometric identification sharper. While improved job-matching is the publicly stated benefit, the sheer market value and technical utility of millions of identity-verified facial portraits for developing foundational models far exceeds the needs of simple platform optimization. LinkedIn’s labeled images therefore serve dual ends, regardless of official justification.

LinkedIn’s algorithmic preference for personal images is not simply about driving engagement; **it is also about harvesting uniquely labeled datasets for AI.** Human attention bias explains part of the effect, but the deeper value lies in the multimodal linkage of names, faces, and roles that other platforms cannot match. Algorithmic incentives push users to produce more of it, even when the images have no professional relevance, turning reputation management into dataset production. Combined with Microsoft’s broader AI pipeline and the industry’s precedent of mass scraping, the pattern is unmistakable.

So while human attention bias may partly explain why selfies outperform professional content, these posts are also purposefully boosted to enrich training data. **LinkedIn is no longer just a professional network, it is an engine that transforms ambition for visibility into raw material for AI, with consequences that reach well beyond the platform itself.**

---

*I’m Anna, a critical futurist with a background in sociology and political science. I founded MindWise to bring AI safety and digital awareness to people outside the tech bubble. I write about the crossroads of labour, technology, and ethics.*

*Originally published on [Paragraph](https://paragraph.com/@alephantom1/faces-first-linkedins-quiet-transformation) on 7 September 2025.*
