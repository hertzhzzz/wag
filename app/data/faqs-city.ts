// City-specific FAQs for Australia-wide city landing pages
// Each city has 5-6 unique questions relevant to local businesses

export type CityFaqItem = {
  question: string
  answer: string
}

export const cityFaqs: Record<string, CityFaqItem[]> = {
  adelaide: [
    {
      question: 'Why should Adelaide businesses visit Chinese factories in person?',
      answer: 'Adelaide is home to a strong network of AV integrators, entertainment venues, and manufacturing businesses that rely on imported equipment and components. Flying direct to Shenzhen twice weekly makes it genuinely practical to conduct factory visits without a major time commitment. Seeing suppliers firsthand helps Adelaide businesses verify quality, build relationships, and negotiate better terms than remote purchasing ever could.',
    },
    {
      question: 'How long does it take to fly from Adelaide to Shenzhen?',
      answer: 'Direct flights from Adelaide to Shenzhen take approximately 13 hours. Adelaide currently has twice-weekly direct services to Shenzhen, making it one of the more accessible Australian cities for China factory visits. The Tuesday and Thursday departure schedule allows for a focused 5-6 day trip covering 3-4 factory visits across key manufacturing hubs.',
    },
    {
      question: 'What industries in Adelaide benefit most from WAG factory visit services?',
      answer: 'Adelaide businesses in audio-visual integration, entertainment and events (including the Adelaide Convention Centre), automotive parts, food processing equipment, and industrial machinery are particularly well-served. Many source specialized components or finished products from Chinese manufacturers and benefit enormously from on-site verification before committing to orders.',
    },
    {
      question: 'Can WAG help Adelaide businesses with the Adelaide Convention Centre supply chain?',
      answer: 'Yes. AV equipment suppliers and event technology companies working with the Adelaide Convention Centre regularly use our services to verify Chinese manufacturers of LED walls, sound systems, rigging equipment, and staging components. We help ensure the equipment meets Australian standards and specifications before purchase.',
    },
    {
      question: 'What makes Adelaide a practical hub for China sourcing?',
      answer: 'Beyond direct flights, Adelaide businesses benefit from shorter queues and more personalized service at Shenzhen factories compared to the busier Guangzhou and Hong Kong routes. The direct connection gives Adelaide-based importers a logistical advantage when establishing long-term supplier relationships.',
    },
    {
      question: 'Does WAG provide support for Adelaide businesses new to importing?',
      answer: 'Absolutely. We guide first-time importers through the entire process, from understanding Incoterms and payment terms to navigating Australian customs requirements. Adelaide has a growing startup and SME scene, and we frequently help businesses who have never sourced from China before get started with confidence.',
    },
  ],

  sydney: [
    {
      question: 'Why is Sydney a major hub for Australian businesses sourcing from China?',
      answer: 'Sydney handles the largest volume of Australia-China trade of any Australian city. Daily flights to Guangzhou, Shenzhen, and Shanghai mean Sydney businesses have maximum flexibility when planning factory visits. The citys strong AV integration sector, automotive aftermarket, and events industry all rely heavily on Chinese manufacturing, making guided factory tours a high-demand service.',
    },
    {
      question: 'How can Sydney businesses benefit from WAG factory visit services?',
      answer: 'Sydney companies sourcing electronics, custom machinery, automotive components, or consumer products benefit from our pre-screened supplier network and bilingual on-site support. We handle the logistics of coordinating visits across multiple factories in different cities within a single trip, maximizing the value of your time away from the office.',
    },
    {
      question: 'What specific industries in Sydney rely most on Chinese factory visits?',
      answer: 'Sydney is Australias leading market for AV integrators and events companies sourcing LED walls, pro audio equipment, and staging gear. The automotive aftermarket, medical device suppliers, and consumer electronics importers also represent significant segments. Fashion and apparel businesses sourcing fabrics and trim from Chinese manufacturers round out the client base.',
    },
    {
      question: 'Can WAG arrange multi-city factory visits for Sydney businesses?',
      answer: 'Yes, we specialize in coordinating trips that span multiple manufacturing hubs. A typical Sydney-originated itinerary might cover electronics factories in Shenzhen, moulding and hardware suppliers in Dongguan, and precision manufacturing in Suzhou or Shanghai. We handle all ground logistics and provide a bilingual guide throughout.',
    },
    {
      question: 'How do Sydney import duties and regulations affect China sourcing?',
      answer: 'Australian import regulations, including standards set by the ACCC and industry-specific requirements, must be considered when sourcing from China. We help Sydney businesses understand compliance obligations, required certifications, and customs documentation. Our post-visit supplier assessments include guidance on what compliance steps each manufacturer can support.',
    },
    {
      question: 'What is the typical timeline for a Sydney business to arrange a factory visit?',
      answer: 'From initial enquiry to departure, the process typically takes 4-6 weeks. This includes 3-7 days for supplier shortlisting based on your requirements, followed by itinerary planning, appointment scheduling, and logistics coordination. We can often accommodate faster timelines for urgent verification needs.',
    },
  ],

  melbourne: [
    {
      question: 'Why do Melbourne businesses choose to visit Chinese factories in person?',
      answer: 'Melbourne is Australias second-largest city and a major manufacturing and industrial hub in its own right. Melbourne businesses in industrial equipment, food processing, packaging, and the events industry source significant volumes from China. A factory visit allows Victorian businesses to verify production capabilities, assess quality management systems, and establish direct relationships with decision-makers.',
    },
    {
      question: 'What manufacturing sectors in Melbourne benefit most from China factory visits?',
      answer: 'Melbourne businesses in food processing equipment, packaging machinery, industrial automation, automotive components, and the events sector (including Melbourne Convention and Exhibition Centre suppliers) are among our most frequent clients. The city also has a strong fashion and textiles industry that sources fabrics and components from Chinese manufacturers.',
    },
    {
      question: 'How do I plan a factory visit trip from Melbourne?',
      answer: 'Melbourne has excellent daily connections to major Chinese manufacturing hubs via Guangzhou, Shanghai, and Shenzhen. Most trips depart Melbourne in the evening and arrive in China the following morning, minimizing time away from your business. We recommend allocating 5-7 days for a productive visit covering 3-5 factories across different cities.',
    },
    {
      question: 'Can WAG help Melbourne businesses with supplier verification for food equipment?',
      answer: 'Yes. Food processing and packaging equipment sourced from China must meet Australian food safety standards. We work with Melbourne businesses to identify factories that can provide required documentation, conduct quality assessments, and arrange sample testing where needed. Our post-visit reports specifically address compliance capability.',
    },
    {
      question: 'What are the key advantages of using WAG versus booking a factory visit independently?',
      answer: 'WAG provides pre-screened supplier networks, bilingual on-site guides, and coordinated logistics that independent visits simply cannot match. We conduct background checks before you arrive, schedule appointments with decision-makers, and provide cultural interpretation during negotiations. Our clients consistently secure better pricing and more reliable supply terms than they could achieve alone.',
    },
    {
      question: 'Does WAG offer ongoing support after a Melbourne business selects a Chinese supplier?',
      answer: 'Yes. Beyond the factory visit itself, we offer procurement support including sample coordination, quality inspection services, production follow-up, and logistics arrangement. Many Melbourne clients use us as their ongoing China sourcing partner, with periodic verification visits and quality audits throughout the year.',
    },
  ],

  perth: [
    {
      question: 'Why is Perth uniquely positioned for Australia-China trade?',
      answer: 'Perth is Australias western gateway to Asia, sitting in a time zone only 2 hours behind Beijing and Shanghai. This closer time alignment means faster communication with suppliers and tighter logistics for shipments arriving into Western Australia. Perth businesses sourcing from China benefit from shorter lead times for both correspondence and freight compared to eastern seaboard cities.',
    },
    {
      question: 'What industries in Perth rely most heavily on Chinese manufacturing?',
      answer: 'Western Australias mining equipment, agricultural machinery, and regional manufacturing sectors are major users of Chinese factory visit services. Mining companies and contractors verify suppliers of pumps, compressors, heavy equipment components, and safety gear. The agricultural sector sources tractors, processing equipment, and irrigation systems. Smaller manufacturing operations in Perth also import tools, hardware, and industrial supplies.',
    },
    {
      question: 'How does WAG support Perth businesses with longer travel requirements?',
      answer: 'Perth currently has fewer direct flight options to China compared to eastern cities, making trip planning more critical. We help Perth clients maximize their time by pre-scheduling all factory appointments, providing detailed briefing materials before departure, and ensuring every day in China is productive. Our ground logistics and bilingual support eliminate wasted time on coordination.',
    },
    {
      question: 'Can WAG help Perth businesses verify suppliers for mining equipment?',
      answer: 'Yes, we work regularly with mining equipment suppliers and contractors verifying Chinese manufacturers of components such as hydraulic systems, conveyor parts, pumping equipment, and heavy vehicle accessories. Our factory assessments include verification of production capacity, quality certifications (including ISO 9001), and compliance with relevant Australian standards.',
    },
    {
      question: 'What logistics advantages does Perth have for China imports?',
      answer: 'Perths geographic position offers significant freight advantages for container shipments from Chinese ports. Sea freight transit times to Fremantle are shorter than to eastern ports, and several major shipping lines maintain regular services. For urgent shipments, air freight from Shenzhen or Guangzhou can reach Perth within 24-48 hours. We help Perth clients optimize both their factory visit schedules and ongoing logistics.',
    },
    {
      question: 'How can agricultural businesses in regional WA benefit from factory visits?',
      answer: 'Regional agricultural businesses sourcing tractors, harvesters, irrigation equipment, or processing machinery from China benefit greatly from on-site verification. We help WA farmers and agricultural contractors identify reputable manufacturers, assess equipment quality, and negotiate terms. Our bilingual support ensures technical specifications are clearly communicated and understood before purchase.',
    },
  ],
}
