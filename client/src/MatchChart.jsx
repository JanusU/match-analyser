import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const data = [
  { round: 1, kills: 2 },
  { round: 2, kills: 0 },
  { round: 3, kills: 3 },
];

export default function MatchChart() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Kills per Round</h2>
      <LineChart width={400} height={300} data={data}>
        <CartesianGrid stroke="#ccc" />
        <XAxis dataKey="round" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="kills" stroke="#8884d8" />
      </LineChart>
    </div>
  );
}

//unused