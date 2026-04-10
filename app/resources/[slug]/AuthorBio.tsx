interface AuthorBioProps {
  author: string
  date: string
  readTime: string
}

export function AuthorBio({ author, date, readTime }: AuthorBioProps) {
  return (
    <div className="flex items-center gap-4 py-6 border-y border-gray-200 mb-8">
      <div className="w-14 h-14 rounded-full bg-[#0F2D5E] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
        {author.split(' ').map(n => n[0]).join('')}
      </div>
      <div>
        <p className="font-semibold text-[#0F2D5E]">{author}</p>
        <p className="text-sm text-gray-500">{date} · {readTime}</p>
      </div>
    </div>
  )
}
