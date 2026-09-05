// src/components/dashboard/ProductivityChart.jsx
import React, { useEffect, useState } from 'react';
import { Card, Button, Collapse } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useAuth } from '../../contexts/AuthContext';
import { useTasks } from '../../contexts/TasksContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ProductivityChart = () => {
  const { user } = useAuth();
  const { tasks } = useTasks();
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [weeklyPoints, setWeeklyPoints] = useState(0);

  useEffect(() => {
    if (!user || !tasks) {
      setLoading(false);
      return;
    }

    const last7Days = [];
    const pointsByDay = {};
    const tasksByDay = {};
    let totalPoints = 0;

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('es', { weekday: 'short', day: 'numeric' });
      last7Days.push(dateStr);
      pointsByDay[dateStr] = 0;
      tasksByDay[dateStr] = 0;
    }

    tasks.forEach((task) => {
      if (task.status === 'completed' && task.completedAt && task.pointsEarned) {
        const date =
          typeof task.completedAt === 'string'
            ? new Date(task.completedAt)
            : task.completedAt?.toDate
            ? task.completedAt.toDate()
            : new Date(task.completedAt);

        const dateStr = date.toLocaleDateString('es', { weekday: 'short', day: 'numeric' });
        if (pointsByDay[dateStr] !== undefined) {
          pointsByDay[dateStr] += task.pointsEarned;
          tasksByDay[dateStr] += 1;
          totalPoints += task.pointsEarned;
        }
      }
    });

    setWeeklyPoints(totalPoints);

    setChartData({
      labels: last7Days,
      datasets: [
        {
          label: 'Puntos',
          data: last7Days.map((day) => pointsByDay[day]),
          backgroundColor: 'rgba(0, 87, 205, 0.7)',
          borderRadius: 6,
          maxBarThickness: 40,
        },
      ],
    });

    setLoading(false);
  }, [user, tasks]);

  if (loading) return null;

  return (
    <Card className="mb-3 shadow-sm">
      <Card.Body className="py-2 px-3">
        <div 
          className="d-flex justify-content-between align-items-center cursor-pointer"
          onClick={() => setOpen(!open)}
          style={{ cursor: 'pointer' }}
        >
          <div className="d-flex align-items-center gap-3">
            <span className="fs-4">📊</span>
            <div>
              <h6 className="mb-0 fw-bold">Productividad Semanal</h6>
              <small className="text-muted">{weeklyPoints} puntos esta semana</small>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            {/* Mini vista previa de barras */}
            {chartData && !open && (
              <div className="d-flex gap-1" style={{ height: '24px' }}>
                {chartData.datasets[0].data.slice(-5).map((value, idx) => (
                  <div
                    key={idx}
                    style={{
                      width: '20px',
                      height: `${Math.min(24, Math.max(4, value / 5))}px`,
                      backgroundColor: '#0057cd',
                      borderRadius: '3px',
                      alignSelf: 'flex-end',
                    }}
                  />
                ))}
              </div>
            )}
            <Button 
              variant="link" 
              size="sm"
              onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
              className="text-decoration-none p-0"
            >
              {open ? '▲ Ver menos' : '▼ Ver gráfico'}
            </Button>
          </div>
        </div>
        
        <Collapse in={open}>
          <div className="mt-3 pt-2 border-top">
            {chartData && (
              <Bar
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: { display: false },
                    tooltip: { callbacks: { label: (ctx) => `${ctx.raw} pts` } },
                  },
                  scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Puntos', font: { size: 10 } } },
                    x: { ticks: { font: { size: 10 } } },
                  },
                }}
                height={150}
              />
            )}
            <div className="text-center mt-2">
              <small className="text-muted">
                Últimos 7 días - Haz clic en una barra para ver detalles
              </small>
            </div>
          </div>
        </Collapse>
      </Card.Body>
    </Card>
  );
};

export default ProductivityChart;