import { STATUS_OPTIONS, TIME_OPTIONS } from '../lib/filters'
import type { GroupFilter, StatusFilter, TimeFilter } from '../lib/filters'

interface FilterSheetProps {
  status: StatusFilter
  time: TimeFilter
  group: GroupFilter
  groups: string[]
  onChangeStatus: (status: StatusFilter) => void
  onChangeTime: (time: TimeFilter) => void
  onChangeGroup: (group: GroupFilter) => void
  onClose: () => void
}

export default function FilterSheet({
  status,
  time,
  group,
  groups,
  onChangeStatus,
  onChangeTime,
  onChangeGroup,
  onClose,
}: FilterSheetProps) {
  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet filter-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="field-label">Статус</div>
        <div className="segmented">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`segmented-btn ${status === opt.value ? 'selected' : ''}`}
              onClick={() => onChangeStatus(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="field-label" style={{ marginTop: 16 }}>
          Время
        </div>
        <div className="segmented wrap">
          {TIME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`segmented-btn ${time === opt.value ? 'selected' : ''}`}
              onClick={() => onChangeTime(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {groups.length > 0 && (
          <>
            <div className="field-label" style={{ marginTop: 16 }}>
              Группа
            </div>
            <div className="segmented wrap">
              <button
                type="button"
                className={`segmented-btn ${group === 'all' ? 'selected' : ''}`}
                onClick={() => onChangeGroup('all')}
              >
                Все
              </button>
              {groups.map((g) => (
                <button
                  key={g}
                  type="button"
                  className={`segmented-btn ${group === g ? 'selected' : ''}`}
                  onClick={() => onChangeGroup(g)}
                >
                  {g}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
