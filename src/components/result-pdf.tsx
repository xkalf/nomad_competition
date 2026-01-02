import { forwardRef } from 'react'
import { RouterOutputs } from '~/utils/api'

type Result = RouterOutputs['result']['findByRound'][number]

interface Props {
  results: Result[]
  competitionName: string
  cubeType: string
  roundName: string
  dnfLimit?: number
}

interface ScoreSheetProps {
  result: Result
  competitionName: string
  cubeType: string
  roundName: string
  groupNumber: string
  dnfLimit?: number
}

const ScoreSheet = ({
  result,
  competitionName,
  cubeType,
  roundName,
  groupNumber,
  dnfLimit = 10.0,
}: ScoreSheetProps) => {
  const competitorName = result.competitor?.user
    ? `${result.competitor.user.firstname} ${result.competitor.user.lastname}`
    : ''
  const competitorId = result.competitor?.verifiedId?.toString() || ''

  return (
    <div className="border border-gray-300 p-2.5 flex flex-col h-full text-xs">
      {/* Header */}
      <h2 className="text-base font-bold text-center mb-1.5">
        {competitionName}
      </h2>

      {/* Event and Group/Round */}
      <div className="flex justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="font-medium">Event:</span>
          <div className="border border-gray-400 px-1.5 py-0.5 min-w-[100px] h-6 flex items-center">
            {cubeType}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-medium">Group Round:</span>
          <div className="border border-gray-400 px-1.5 py-0.5 w-7 h-6 text-center flex items-center justify-center">
            {groupNumber}
          </div>
        </div>
      </div>

      {/* ID and Name */}
      <div className="flex justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="font-medium">ID:</span>
          <div className="border border-gray-400 px-1.5 py-0.5 min-w-[50px] h-6 flex items-center">
            {competitorId}
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-1 ml-3">
          <span className="font-medium">Name:</span>
          <div className="border border-gray-400 px-1.5 py-0.5 flex-1 h-6 flex items-center">
            {competitorName}
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="flex-1 mb-1.5 mt-4">
        <table className="w-full border-collapse print:border-collapse result-pdf">
          <thead>
            <tr>
              <th className="border border-gray-400 px-1.5 py-1 text-left font-medium w-8">
                №
              </th>
              <th className="border border-gray-400 px-1.5 py-1 text-left font-medium w-auto">
                Result
              </th>
              <th className="border border-gray-400 px-1.5 py-1 text-left font-medium w-8">
                Competitor
              </th>
              <th className="border border-gray-400 px-1.5 py-1 text-left font-medium w-8">
                Judge
              </th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((num) => (
              <tr key={num}>
                <td className="border border-gray-400 px-1.5 py-1.5 text-center h-7">
                  {num}
                </td>
                <td className="border border-gray-400 px-1.5 py-1.5 h-10"></td>
                <td className="border border-gray-400 px-1.5 py-1.5 h-10"></td>
                <td className="border border-gray-400 px-1.5 py-1.5 h-10"></td>
              </tr>
            ))}
            <tr className="mt-4">
              <td className="border border-gray-400 px-1.5 py-1.5 text-center font-medium">
                E
              </td>
              <td className="border border-gray-400 px-1.5 py-1.5 h-10"></td>
              <td className="border border-gray-400 px-1.5 py-1.5 h-10"></td>
              <td className="border border-gray-400 px-1.5 py-1.5 h-10"></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* DNF Limit */}
      <div className="text-[10px] text-left">
        DNF limit: {dnfLimit.toFixed(2)}
      </div>
    </div>
  )
}

const ResultPdf = forwardRef<HTMLDivElement, Props>(
  ({ results, competitionName, cubeType, roundName, dnfLimit }, ref) => {
    // Group results by their group field
    const groupedResults = results.reduce(
      (acc, result) => {
        const group = result.group || '1'
        if (!acc[group]) {
          acc[group] = []
        }
        acc[group].push(result)
        return acc
      },
      {} as Record<string, Result[]>,
    )

    // Flatten into array of results, each representing one score sheet
    const scoreSheets: Result[] = Object.entries(groupedResults).flatMap(
      ([group, groupResults]) => groupResults,
    )

    // Calculate pages: 4 score sheets per page
    const sheetsPerPage = 4
    const totalPages = Math.ceil(scoreSheets.length / sheetsPerPage)

    return (
      <div ref={ref}>
        {Array.from({ length: totalPages }).map((_, pageIndex) => (
          <div
            key={pageIndex}
            className="w-[21cm] h-[29.7cm] p-4 flex flex-col"
            style={{ pageBreakAfter: 'always' }}
          >
            {/* 2x2 Grid */}
            <div className="grid grid-cols-2 grid-rows-2 gap-3 h-full">
              {Array.from({ length: sheetsPerPage }).map((_, sheetIndex) => {
                const resultIndex = pageIndex * sheetsPerPage + sheetIndex
                const result = scoreSheets[resultIndex]
                const groupNumber = result?.group || '1'

                if (!result) {
                  return <div key={`empty-${pageIndex}-${sheetIndex}`}></div>
                }

                return (
                  <ScoreSheet
                    key={`sheet-${pageIndex}-${sheetIndex}-${result.id}`}
                    result={result}
                    competitionName={competitionName}
                    cubeType={cubeType}
                    roundName={roundName}
                    groupNumber={groupNumber}
                    dnfLimit={dnfLimit}
                  />
                )
              })}
            </div>
          </div>
        ))}
      </div>
    )
  },
)

ResultPdf.displayName = 'ResultPdf'

export default ResultPdf
