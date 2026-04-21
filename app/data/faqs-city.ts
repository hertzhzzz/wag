// City-specific FAQs for Australia-wide city landing pages
// Each city has 5-6 unique questions relevant to local businesses
// Answers restructured: direct answer first (≤60 words visual), supporting detail after

export type CityFaqItem = {
  question: string
  answer: string
}

export const cityFaqs: Record<string, CityFaqItem[]> = {
  adelaide: [
    {
      question: 'Why should Adelaide businesses visit Chinese factories in person?',
      answer: 'Yes — Adelaide businesses benefit enormously from on-site factory visits. Flying direct to Shenzhen twice weekly makes it practical, and seeing suppliers firsthand lets you verify quality, build relationships, and negotiate better terms than remote purchasing ever could.',
    },
    {
      question: 'How long does it take to fly from Adelaide to Shenzhen?',
      answer: 'Direct flights take approximately 13 hours. Adelaide has twice-weekly direct services (Tuesday and Thursday departures), making it one of the more accessible Australian cities for focused 5-6 day factory visit trips covering 3-4 factories.',
    },
    {
      question: 'What industries in Adelaide benefit most from WAG factory visit services?',
      answer: 'Adelaide businesses in audio-visual integration, food processing equipment, automotive parts, and industrial machinery benefit most. Many source specialised components or finished products from Chinese manufacturers and need on-site verification before committing.',
    },
    {
      question: 'Can WAG help Adelaide businesses with the Adelaide Convention Centre supply chain?',
      answer: 'Yes. AV equipment suppliers and event technology companies working with the Adelaide Convention Centre use our services to verify Chinese manufacturers of LED walls, sound systems, rigging equipment, and staging components against Australian standards.',
    },
    {
      question: 'What makes Adelaide a practical hub for China sourcing?',
      answer: 'Beyond direct flights, Adelaide businesses get shorter queues and more personalised service at Shenzhen factories compared to busier Guangzhou routes. The Tuesday/Thursday departure schedule suits focused trip itineraries.',
    },
    {
      question: 'Does WAG provide support for Adelaide businesses new to importing?',
      answer: 'Yes. We guide first-time importers through Incoterms, payment terms, and Australian customs requirements. We frequently help Adelaide startups and SMEs who have never sourced from China before get started with confidence.',
    },
  ],

  sydney: [
    {
      question: 'Why is Sydney a major hub for Australian businesses sourcing from China?',
      answer: 'Sydney handles the largest volume of Australia-China trade. Daily flights to Guangzhou, Shenzhen, and Shanghai give maximum flexibility. The city\'s strong AV integration sector, automotive aftermarket, and events industry all rely heavily on Chinese manufacturing.',
    },
    {
      question: 'How can Sydney businesses benefit from WAG factory visit services?',
      answer: 'Sydney companies sourcing electronics, machinery, automotive components, or consumer products benefit from our pre-screened supplier network and bilingual on-site support. We coordinate visits across multiple factories in different cities within a single trip.',
    },
    {
      question: 'What specific industries in Sydney rely most on Chinese factory visits?',
      answer: 'Sydney leads Australia for AV integrators and events companies sourcing LED walls, pro audio, and staging gear. Medical device suppliers, automotive aftermarket businesses, and consumer electronics importers also represent significant segments.',
    },
    {
      question: 'Can WAG arrange multi-city factory visits for Sydney businesses?',
      answer: 'Yes — we specialise in multi-city trips covering electronics factories in Shenzhen, moulding suppliers in Dongguan, and precision manufacturing in Suzhou or Shanghai. We handle all logistics and provide a bilingual guide throughout.',
    },
    {
      question: 'How do Sydney import duties and regulations affect China sourcing?',
      answer: 'Australian import regulations and ACCC standards must be considered when sourcing from China. We help Sydney businesses understand compliance obligations, required certifications, and customs documentation before purchase.',
    },
    {
      question: 'What is the typical timeline for a Sydney business to arrange a factory visit?',
      answer: 'From enquiry to departure typically takes 4-6 weeks: 3-7 days for supplier shortlisting, followed by itinerary planning and logistics coordination. We can accommodate faster timelines for urgent verification needs.',
    },
  ],

  melbourne: [
    {
      question: 'Why do Melbourne businesses choose to visit Chinese factories in person?',
      answer: 'Melbourne is a major manufacturing and industrial hub. A factory visit lets Victorian businesses verify production capabilities, assess quality management systems, and establish direct relationships with decision-makers before committing to orders.',
    },
    {
      question: 'What manufacturing sectors in Melbourne benefit most from China factory visits?',
      answer: 'Melbourne businesses in food processing equipment, packaging machinery, industrial automation, automotive components, and the events sector benefit most. The city also has a strong fashion and textiles industry sourcing fabrics and components from Chinese manufacturers.',
    },
    {
      question: 'How do I plan a factory visit trip from Melbourne?',
      answer: 'Melbourne has daily connections to Guangzhou, Shanghai, and Shenzhen. Most trips depart in the evening and arrive the following morning. We recommend 5-7 days covering 3-5 factories across different cities for a productive visit.',
    },
    {
      question: 'Can WAG help Melbourne businesses with supplier verification for food equipment?',
      answer: 'Yes. Food processing equipment sourced from China must meet Australian food safety standards. We identify factories that can provide required documentation, conduct quality assessments, and arrange sample testing. Our post-visit reports address compliance capability.',
    },
    {
      question: 'What are the key advantages of using WAG versus booking independently?',
      answer: 'WAG provides pre-screened supplier networks, bilingual guides, and coordinated logistics that independent visits cannot match. We conduct background checks, schedule appointments with decision-makers, and provide cultural interpretation during negotiations.',
    },
    {
      question: 'Does WAG offer ongoing support after a Melbourne business selects a Chinese supplier?',
      answer: 'Yes. Beyond the factory visit, we offer procurement support including sample coordination, quality inspections, production follow-up, and logistics. Many Melbourne clients use us as an ongoing China sourcing partner with periodic verification visits.',
    },
  ],

  perth: [
    {
      question: 'Why is Perth uniquely positioned for Australia-China trade?',
      answer: 'Perth is Australia\'s western gateway to Asia, only 2 hours behind Beijing and Shanghai. This closer time zone means faster communication with suppliers and shorter lead times for freight shipments arriving into Western Australia.',
    },
    {
      question: 'What industries in Perth rely most heavily on Chinese manufacturing?',
      answer: 'Western Australia\'s mining equipment, agricultural machinery, and regional manufacturing sectors are major users. Mining companies verify suppliers of pumps, compressors, and heavy equipment components. The agricultural sector sources tractors, processing equipment, and irrigation systems.',
    },
    {
      question: 'How does WAG support Perth businesses with longer travel requirements?',
      answer: 'Perth has fewer direct flight options than eastern cities, making trip planning critical. We maximise your time by pre-scheduling all appointments, providing briefing materials before departure, and ensuring every day in China is productive.',
    },
    {
      question: 'Can WAG help Perth businesses verify suppliers for mining equipment?',
      answer: 'Yes. We work with mining equipment suppliers verifying Chinese manufacturers of hydraulic systems, conveyor parts, pumping equipment, and heavy vehicle accessories. Our assessments verify production capacity, ISO 9001 certifications, and Australian standards compliance.',
    },
    {
      question: 'What logistics advantages does Perth have for China imports?',
      answer: 'Perth\'s geographic position offers shorter sea freight transit times from Chinese ports to Fremantle compared to eastern ports. For urgent shipments, air freight from Shenzhen or Guangzhou can reach Perth within 24-48 hours. We help optimise both visit schedules and ongoing logistics.',
    },
    {
      question: 'How can agricultural businesses in regional WA benefit from factory visits?',
      answer: 'Regional agricultural businesses sourcing tractors, harvesters, irrigation equipment, or processing machinery from China benefit from on-site verification. We help identify reputable manufacturers, assess equipment quality, and ensure technical specifications are clearly communicated before purchase.',
    },
  ],
}